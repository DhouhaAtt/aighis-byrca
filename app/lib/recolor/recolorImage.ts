import {
  averageColor,
  clamp,
  hexToRgb,
  labToRgb,
  rgbToHex,
  rgbToLab,
  type Lab,
} from "./colorMath";
import { loadMaskRaster, loadRaster } from "./imageUtils";
import { recoverEdgePixels } from "./maskRefinement";

export interface RecolorOptions {
  imageSource: string;
  maskSource: string;
  hex: string;
  maxDimension?: number;
  strength?: number;
}

export interface RecolorResult {
  dataUrl: string;
  coverage: number;
}

const CACHE_LIMIT = 24;
const cache = new Map<string, string>();

function cacheKey(options: RecolorOptions): string {
  return [
    "v11",
    options.imageSource,
    options.maskSource,
    options.hex.toLowerCase(),
    options.maxDimension ?? 1400,
    options.strength ?? 1,
  ].join("|");
}

function remember(key: string, value: string) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, value);
}

function mix(a: number, b: number, amount: number): number {
  return a + (b - a) * amount;
}

export async function recolorImageWithMask(
  options: RecolorOptions
): Promise<RecolorResult> {
  const key = cacheKey(options);
  const cached = cache.get(key);
  if (cached) {
    return { dataUrl: cached, coverage: 1 };
  }

  const raster = await loadRaster(options.imageSource, options.maxDimension ?? 1400);
  const { width, height, imageData } = raster;
  const data = imageData.data;
  const mask = await loadMaskRaster(options.maskSource, width, height);
  const foreground = new Uint8Array(width * height);

  for (let p = 0; p < foreground.length; p += 1) {
    foreground[p] = mask[p * 4 + 3] >= 128 ? 1 : 0;
  }
  const recoveredForeground = recoverEdgePixels(foreground, data, width, height);
  for (let p = 0; p < foreground.length; p += 1) {
    if (recoveredForeground[p] && !foreground[p]) {
      const alpha = p * 4 + 3;
      // A recovered contour pixel remains partially covered so interpolation
      // stays smooth and a marginal color match cannot paint the background.
      mask[alpha] = Math.max(mask[alpha], 144);
    }
  }

  const targetRgb = hexToRgb(options.hex);
  const target: Lab = rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b);
  const targetChroma = Math.sqrt(target.a * target.a + target.b * target.b);

  let meanL = 0;
  let meanL2 = 0;
  let meanA = 0;
  let meanB = 0;
  let weight = 0;
  let covered = 0;

  for (let p = 0; p < width * height; p += 1) {
    const offset = p * 4;
    const coverage = mask[offset + 3] / 255;
    if (coverage <= 0.05) continue;
    const lab = rgbToLab(data[offset], data[offset + 1], data[offset + 2]);
    meanL += lab.L * coverage;
    meanL2 += lab.L * lab.L * coverage;
    meanA += lab.a * coverage;
    meanB += lab.b * coverage;
    weight += coverage;
    if (coverage > 0.5) covered += 1;
  }

  if (weight === 0) {
    throw new Error("The segmentation mask is empty");
  }

  meanL /= weight;
  meanA /= weight;
  meanB /= weight;
  const stdL = Math.sqrt(Math.max(0, meanL2 / weight - meanL * meanL));

  const output = new Uint8ClampedArray(data.length);
  const strength = clamp(options.strength ?? 1, 0, 1);

  // Keep local luminance structure around the chosen fabric tone. The previous
  // target-specific clipping crushed black shadows and then used a hard detail
  // threshold to restore original pixels, which produced patchy paint-like areas.
  const detailGain = clamp(0.84 - stdL / 500, 0.68, 0.84);
  const chromaResidual = targetChroma < 8 ? 0.12 : 0.32;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      const offset = p * 4;
      const coverage = mask[offset + 3] / 255;

      if (coverage <= 0.004) {
        output[offset] = data[offset];
        output[offset + 1] = data[offset + 1];
        output[offset + 2] = data[offset + 2];
        output[offset + 3] = data[offset + 3];
        continue;
      }

      const originalR = data[offset];
      const originalG = data[offset + 1];
      const originalB = data[offset + 2];
      const lab = rgbToLab(originalR, originalG, originalB);

      const newL = clamp(target.L + (lab.L - meanL) * detailGain, 0, 100);
      const newA = target.a + (lab.a - meanA) * chromaResidual;
      const newB = target.b + (lab.b - meanB) * chromaResidual;

      const recolored = labToRgb({ L: newL, a: newA, b: newB });

      const blend = coverage * strength;
      output[offset] = mix(originalR, recolored.r, blend);
      output[offset + 1] = mix(originalG, recolored.g, blend);
      output[offset + 2] = mix(originalB, recolored.b, blend);
      output[offset + 3] = data[offset + 3];
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  const resultImage = context.createImageData(width, height);
  resultImage.data.set(output);
  context.putImageData(resultImage, 0, 0);

  const dataUrl = canvas.toDataURL("image/png");
  remember(key, dataUrl);

  return { dataUrl, coverage: covered / (width * height) };
}

export async function computeMaskedAverageColor(
  imageSource: string,
  maskSource: string,
  maxDimension = 600
): Promise<string | null> {
  const raster = await loadRaster(imageSource, maxDimension);
  const mask = await loadMaskRaster(maskSource, raster.width, raster.height);
  const average = averageColor(raster.imageData.data, mask, 2);
  return average ? rgbToHex(average) : null;
}

export function clearRecolorCache() {
  cache.clear();
}
