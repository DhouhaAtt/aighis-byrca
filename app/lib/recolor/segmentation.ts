import { averageColor, clamp, colorDistance, type RGB } from "./colorMath";
import {
  imageDataToDataUrl,
  loadRaster,
} from "./imageUtils";
import { recoverEdgePixels } from "./maskRefinement";
import type { RecolorEngine } from "./types";

export interface SegmentationResult {
  maskDataUrl: string;
  width: number;
  height: number;
  confidence: number;
  coverage: number;
  sourceColor: string | null;
  engine: RecolorEngine;
  warnings: string[];
}

interface BackgroundCluster extends RGB {
  count: number;
}

function buildBackgroundClusters(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  border: number
): BackgroundCluster[] {
  const buckets = new Map<string, BackgroundCluster>();

  const add = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    if (data[index + 3] < 16) return;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const key = `${r >> 4}:${g >> 4}:${b >> 4}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < border || y < border || x >= width - border || y >= height - border) {
        add(x, y);
      }
    }
  }

  const total = [...buckets.values()].reduce((sum, bucket) => sum + bucket.count, 0);
  return [...buckets.values()]
    .filter((bucket) => bucket.count >= Math.max(8, total * 0.025))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((bucket) => ({
      r: bucket.r / bucket.count,
      g: bucket.g / bucket.count,
      b: bucket.b / bucket.count,
      count: bucket.count,
    }));
}

function distanceToClusters(
  clusters: BackgroundCluster[],
  r: number,
  g: number,
  b: number
): number {
  if (clusters.length === 0) return 999;
  let best = Infinity;
  for (const cluster of clusters) {
    const dr = cluster.r - r;
    const dg = cluster.g - g;
    const db = cluster.b - b;
    const distance = dr * dr + dg * dg + db * db;
    if (distance < best) best = distance;
  }
  return Math.sqrt(best);
}

function computeEdges(data: Uint8ClampedArray, width: number, height: number) {
  const edges = new Float32Array(width * height);
  const channel = (pixel: number, index: number) => data[pixel * 4 + index];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = y * width + x;
      let gradient = 0;
      for (let c = 0; c < 3; c += 1) {
        const tl = channel(p - width - 1, c);
        const tc = channel(p - width, c);
        const tr = channel(p - width + 1, c);
        const ml = channel(p - 1, c);
        const mr = channel(p + 1, c);
        const bl = channel(p + width - 1, c);
        const bc = channel(p + width, c);
        const br = channel(p + width + 1, c);
        const gx = tl + 2 * ml + bl - (tr + 2 * mr + br);
        const gy = tl + 2 * tc + tr - (bl + 2 * bc + br);
        gradient += gx * gx + gy * gy;
      }
      // Combine per-channel gradients so subtle warm fabric edges remain
      // visible even where their grayscale luminance nearly matches the set.
      edges[p] = Math.sqrt(gradient / 3) / 4;
    }
  }
  return edges;
}

function refineMaskBoundary(
  mask: Uint8Array,
  source: Uint8ClampedArray,
  width: number,
  height: number
): Float32Array {
  const output = new Float32Array(mask.length);
  const radius = 2;
  const spatialSigma = 1.25;
  const colorSigma = 18;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      const inside = mask[p] > 0;
      let boundary = false;
      for (let dy = -1; dy <= 1 && !boundary; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if ((mask[ny * width + nx] > 0) !== inside) {
            boundary = true;
            break;
          }
        }
      }

      if (!boundary) {
        output[p] = inside ? 1 : 0;
        continue;
      }

      // Keep feathering on the garment side of the contour. A symmetric
      // bilateral average gives exterior white pixels nonzero coverage, which
      // turns them into visibly tinted pixels after recoloring. Interior edge
      // pixels still receive fractional coverage for a smooth antialiased rim.
      if (!inside) {
        output[p] = 0;
        continue;
      }

      const offset = p * 4;
      const r = source[offset];
      const g = source[offset + 1];
      const b = source[offset + 2];
      let weightedCoverage = 0;
      let totalWeight = 0;

      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const neighbor = ny * width + nx;
          const neighborOffset = neighbor * 4;
          const dr = r - source[neighborOffset];
          const dg = g - source[neighborOffset + 1];
          const db = b - source[neighborOffset + 2];
          const colorDistanceSquared = (dr * dr + dg * dg + db * db) / 3;
          const spatialDistanceSquared = dx * dx + dy * dy;
          const weight = Math.exp(
            -spatialDistanceSquared / (2 * spatialSigma * spatialSigma) -
              colorDistanceSquared / (2 * colorSigma * colorSigma)
          );
          weightedCoverage += (mask[neighbor] / 255) * weight;
          totalWeight += weight;
        }
      }
      output[p] = totalWeight > 0 ? weightedCoverage / totalWeight : Number(inside);
    }
  }
  return output;
}

/** Close one-pixel contour notches without bridging visible garment gaps. */
function closeOnePixelNotches(mask: Uint8Array, width: number, height: number) {
  const dilated = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      if (mask[p]) {
        dilated[p] = 255;
        continue;
      }
      let found = false;
      for (let dy = -1; dy <= 1 && !found; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < width && ny < height && mask[ny * width + nx]) {
            dilated[p] = 255;
            found = true;
            break;
          }
        }
      }
    }
  }

  const closed = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let fullyCovered = true;
      for (let dy = -1; dy <= 1 && fullyCovered; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height || !dilated[ny * width + nx]) {
            fullyCovered = false;
            break;
          }
        }
      }
      if (fullyCovered) closed[y * width + x] = 255;
    }
  }
  return closed;
}

/** Fill only small enclosed segmentation specks; preserve large cutouts and leg gaps. */
function fillSmallEnclosedHoles(mask: Uint8Array, width: number, height: number) {
  const outside = new Uint8Array(mask.length);
  const queue = new Int32Array(mask.length);
  let head = 0;
  let tail = 0;

  const addOutside = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (mask[p] || outside[p]) return;
    outside[p] = 1;
    queue[tail++] = p;
  };

  for (let x = 0; x < width; x += 1) {
    addOutside(x, 0);
    addOutside(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    addOutside(0, y);
    addOutside(width - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = Math.floor(p / width);
    addOutside(x - 1, y);
    addOutside(x + 1, y);
    addOutside(x, y - 1);
    addOutside(x, y + 1);
  }

  const seen = outside.slice();
  const filled = mask.slice();
  const maxHoleArea = Math.max(64, Math.floor(mask.length * 0.0015));

  for (let start = 0; start < mask.length; start += 1) {
    if (mask[start] || seen[start]) continue;
    head = 0;
    tail = 0;
    queue[tail++] = start;
    seen[start] = 1;
    let area = 0;

    while (head < tail) {
      const p = queue[head++];
      area += 1;
      const x = p % width;
      const y = Math.floor(p / width);
      const addHole = (nx: number, ny: number) => {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
        const next = ny * width + nx;
        if (mask[next] || seen[next]) return;
        seen[next] = 1;
        queue[tail++] = next;
      };
      addHole(x - 1, y);
      addHole(x + 1, y);
      addHole(x, y - 1);
      addHole(x, y + 1);
    }

    if (area <= maxHoleArea) {
      for (let i = 0; i < tail; i += 1) filled[queue[i]] = 255;
    }
  }
  return filled;
}

function extractComponents(
  foreground: Uint8Array,
  width: number,
  height: number
): { mask: Uint8Array; largestShare: number; components: number } {
  const labels = new Int32Array(foreground.length).fill(-1);
  const queue = new Int32Array(foreground.length);
  const areas: number[] = [];
  let label = 0;

  for (let start = 0; start < foreground.length; start += 1) {
    if (!foreground[start] || labels[start] !== -1) continue;

    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    labels[start] = label;
    let area = 0;

    while (head < tail) {
      const p = queue[head++];
      area += 1;
      const x = p % width;
      const y = Math.floor(p / width);

      const push = (nx: number, ny: number) => {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
        const next = ny * width + nx;
        if (!foreground[next] || labels[next] !== -1) return;
        labels[next] = label;
        queue[tail++] = next;
      };

      push(x - 1, y);
      push(x + 1, y);
      push(x, y - 1);
      push(x, y + 1);
    }

    areas.push(area);
    label += 1;
  }

  const largest = areas.length > 0 ? Math.max(...areas) : 0;
  const minArea = Math.max(24, largest * 0.000005, foreground.length * 0.00002);
  const keep = new Uint8Array(foreground.length);
  let kept = 0;

  for (let p = 0; p < foreground.length; p += 1) {
    const id = labels[p];
    if (id !== -1 && areas[id] >= minArea) {
      keep[p] = 255;
      kept += 1;
    }
  }

  return {
    mask: keep,
    largestShare: kept > 0 ? largest / kept : 0,
    components: areas.filter((area) => area >= minArea).length,
  };
}

export async function segmentProduct(
  imageSource: string,
  maxDimension = Number.MAX_SAFE_INTEGER
): Promise<SegmentationResult> {
  const raster = await loadRaster(imageSource, maxDimension);
  const { width, height, imageData } = raster;
  const data = imageData.data;
  const pixels = width * height;
  const edges = computeEdges(data, width, height);

  const border = Math.max(2, Math.round(Math.min(width, height) * 0.015));
  const clusters = buildBackgroundClusters(data, width, height, border);

  const visited = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let head = 0;
  let tail = 0;

  const seed = (p: number) => {
    if (visited[p]) return;
    visited[p] = 1;
    queue[tail++] = p;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < border || y < border || x >= width - border || y >= height - border) {
        seed(y * width + x);
      }
    }
  }

  // A broad RGB radius (the old value was 112) let the flood cross the soft
  // edge from a white studio background into cream fabric. Keep the reachable
  // background region close to the border's actual color and stop at edges.
  const edgeThreshold = 14;
  const localTolerance = 10;
  const modelTolerance = 12;
  const maxModelDistance = 14;

  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = Math.floor(p / width);
    const offset = p * 4;
    const cr = data[offset];
    const cg = data[offset + 1];
    const cb = data[offset + 2];

    const visit = (nx: number, ny: number) => {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
      const next = ny * width + nx;
      if (visited[next]) return;

      const nextOffset = next * 4;
      if (data[nextOffset + 3] < 12) {
        visited[next] = 1;
        queue[tail++] = next;
        return;
      }

      const nr = data[nextOffset];
      const ng = data[nextOffset + 1];
      const nb = data[nextOffset + 2];
      const localDistance = Math.sqrt(
        (nr - cr) * (nr - cr) + (ng - cg) * (ng - cg) + (nb - cb) * (nb - cb)
      );
      const modelDistance = distanceToClusters(clusters, nr, ng, nb);

      const isBackgroundColor = modelDistance < maxModelDistance;
      const notEdge = edges[next] < edgeThreshold;
      const continuesRegion = localDistance < localTolerance;
      const nearModel = modelDistance < modelTolerance;

      if (notEdge && isBackgroundColor && (continuesRegion || nearModel)) {
        visited[next] = 1;
        queue[tail++] = next;
      }
    };

    visit(x - 1, y);
    visit(x + 1, y);
    visit(x, y - 1);
    visit(x, y + 1);
  }

  const foreground = new Uint8Array(pixels);
  const garmentChromaHistogram = new Uint32Array(512);
  let garmentCorePixels = 0;
  let borderTotal = 0;
  let borderBackground = 0;

  for (let p = 0; p < pixels; p += 1) {
    const offset = p * 4;
    if (data[offset + 3] < 12 || visited[p]) continue;
    foreground[p] = 1;

    // Cast shadows on pale studio backdrops are usually much less chromatic
    // than fabric. Estimate the fabric's chroma from confident foreground
    // pixels, then reject only weak, near-background candidates with matching
    // background chroma. Strongly separated neutral fabrics remain included.
    const background = clusters[0];
    if (!background || distanceToClusters(clusters, data[offset], data[offset + 1], data[offset + 2]) < 35) continue;
    const deltaRg = (data[offset] - data[offset + 1]) - (background.r - background.g);
    const deltaGb = (data[offset + 1] - data[offset + 2]) - (background.g - background.b);
    const chroma = Math.min(511, Math.round(Math.hypot(deltaRg, deltaGb)));
    garmentChromaHistogram[chroma] += 1;
    garmentCorePixels += 1;
  }

  let medianChroma = 0;
  let chromaCount = 0;
  const chromaMedianTarget = Math.floor(garmentCorePixels / 2);
  while (medianChroma < garmentChromaHistogram.length - 1 && chromaCount <= chromaMedianTarget) {
    chromaCount += garmentChromaHistogram[medianChroma];
    if (chromaCount <= chromaMedianTarget) medianChroma += 1;
  }
  const minimumFabricChroma = Math.max(3, medianChroma * 0.65);
  const nearBackgroundLimit = Math.max(80, maxModelDistance * 2.5);
  const foregroundBeforeShadowFilter = foreground.slice();

  for (let p = 0; p < pixels; p += 1) {
    if (!foreground[p]) continue;
    const offset = p * 4;
    const background = clusters[0];
    if (!background) continue;
    const distance = distanceToClusters(clusters, data[offset], data[offset + 1], data[offset + 2]);
    if (distance >= nearBackgroundLimit) continue;
    const deltaRg = (data[offset] - data[offset + 1]) - (background.r - background.g);
    const deltaGb = (data[offset + 1] - data[offset + 2]) - (background.g - background.b);
    if (Math.hypot(deltaRg, deltaGb) >= minimumFabricChroma) continue;

    // Reject weak, background-colored shadow pixels unless they are locally
    // supported by several neighboring fabric pixels. This keeps genuine
    // contour pixels and stitching while removing thin cast-shadow trails.
    const x = p % width;
    const y = Math.floor(p / width);
    let garmentNeighbors = 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (foregroundBeforeShadowFilter[ny * width + nx]) garmentNeighbors += 1;
      }
    }
    if (garmentNeighbors < 3) foreground[p] = 0;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < border || y < border || x >= width - border || y >= height - border) {
        const p = y * width + x;
        borderTotal += 1;
        if (visited[p]) borderBackground += 1;
      }
    }
  }

  const edgeRecovered = recoverEdgePixels(foreground, data, width, height);
  const extracted = extractComponents(edgeRecovered, width, height);
  const mask = extracted.mask;

  // Avoid global hole filling: large enclosed background pockets can be real
  // cutouts, such as the gap between trouser legs. Fill only small specks.
  const smoothedContour = closeOnePixelNotches(
    closeOnePixelNotches(mask, width, height),
    width,
    height
  );
  const refined = fillSmallEnclosedHoles(smoothedContour, width, height);

  const edgeCoverage = refineMaskBoundary(refined, data, width, height);
  const output = new Uint8ClampedArray(pixels * 4);
  const coverageMask = new Uint8ClampedArray(pixels * 4);
  let coverage = 0;

  for (let p = 0; p < pixels; p += 1) {
    const offset = p * 4;
    const alpha = Math.round(edgeCoverage[p] * 255);
    // Store an ordinary opaque grayscale mask. White is fabric; black is
    // background. Intermediate values remain usable as edge coverage.
    output[offset] = alpha;
    output[offset + 1] = alpha;
    output[offset + 2] = alpha;
    output[offset + 3] = 255;
    coverageMask[offset + 3] = alpha;
    if (edgeCoverage[p] > 0.5) coverage += 1;
  }
  coverage /= pixels;

  const averageRgb = averageColor(data, coverageMask, 2);
  const sourceColor = averageRgb
    ? `#${Math.round(averageRgb.r).toString(16).padStart(2, "0")}${Math.round(
        averageRgb.g
      )
        .toString(16)
        .padStart(2, "0")}${Math.round(averageRgb.b)
        .toString(16)
        .padStart(2, "0")}`
    : null;

  const warnings: string[] = [];
  let confidence = 0.3;

  if (coverage >= 0.02 && coverage <= 0.85) confidence += 0.25;
  if (borderBackground / Math.max(1, borderTotal) >= 0.8) confidence += 0.2;
  if (clusters.length > 0) confidence += 0.1;
  if (extracted.largestShare >= 0.35) confidence += 0.1;

  if (coverage < 0.02) {
    warnings.push("Very little of the image was detected as product.");
  } else if (coverage > 0.88) {
    warnings.push("Almost the whole image was detected as product.");
  }
  if (borderBackground / Math.max(1, borderTotal) < 0.55) {
    warnings.push("The product may touch the image border.");
  }
  if (extracted.components > 6) {
    warnings.push("Several separate objects were detected.");
  }

  const bgAverage = clusters[0]
    ? { r: clusters[0].r, g: clusters[0].g, b: clusters[0].b }
    : null;
  if (
    averageRgb &&
    bgAverage &&
    colorDistance(averageRgb, bgAverage) < 16 &&
    coverage > 0.2
  ) {
    confidence -= 0.2;
    warnings.push(
      "The product is very close to the background colour. Check the mask and correct it manually."
    );
  }

  confidence = clamp(confidence, 0.12, 0.97);

  return {
    maskDataUrl: imageDataToDataUrl(output, width, height),
    width,
    height,
    confidence,
    coverage,
    sourceColor,
    engine: "local",
    warnings,
  };
}

const SEGMENTATION_CACHE_LIMIT = 8;
const segmentationCache = new Map<string, SegmentationResult>();

export async function segmentProductCached(
  imageSource: string,
  maxDimension = Number.MAX_SAFE_INTEGER
): Promise<SegmentationResult> {
  const cacheKey = `${maxDimension}:${imageSource}`;
  const cached = segmentationCache.get(cacheKey);
  if (cached) return cached;

  const result = await segmentProduct(imageSource, maxDimension);

  if (segmentationCache.size >= SEGMENTATION_CACHE_LIMIT) {
    const oldest = segmentationCache.keys().next().value;
    if (oldest) segmentationCache.delete(oldest);
  }
  segmentationCache.set(cacheKey, result);
  return result;
}

