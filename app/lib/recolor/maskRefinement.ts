/** Recover only contour pixels whose source colors favor the foreground. */
export function recoverEdgePixels(
  foreground: Uint8Array,
  source: Uint8ClampedArray,
  width: number,
  height: number
) {
  let current = foreground.slice();
  const radius = 2;

  // Recheck the new boundary each pass, limiting recovery to two pixels.
  for (let pass = 0; pass < 2; pass += 1) {
    const refined = current.slice();
    for (let y = radius; y < height - radius; y += 1) {
      for (let x = radius; x < width - radius; x += 1) {
        const p = y * width + x;
        if (current[p]) continue;

        let adjacentForeground = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (current[(y + dy) * width + x + dx]) adjacentForeground += 1;
          }
        }
        if (adjacentForeground < 2) continue;

        let nearestForeground = Infinity;
        let nearestBackground = Infinity;
        for (let dy = -radius; dy <= radius; dy += 1) {
          for (let dx = -radius; dx <= radius; dx += 1) {
            // The candidate is background; comparing it to itself makes the
            // nearest-background distance zero and blocks all edge recovery.
            if (dx === 0 && dy === 0) continue;
            const neighbor = (y + dy) * width + x + dx;
            const offset = neighbor * 4;
            const dr = source[p * 4] - source[offset];
            const dg = source[p * 4 + 1] - source[offset + 1];
            const db = source[p * 4 + 2] - source[offset + 2];
            const distance = dr * dr + dg * dg + db * db;
            if (current[neighbor]) nearestForeground = Math.min(nearestForeground, distance);
            else nearestBackground = Math.min(nearestBackground, distance);
          }
        }

        // Stay conservative on pale products while allowing antialiased edge
        // pixels through when foreground evidence is slightly stronger.
        if (nearestForeground + 4 < nearestBackground) refined[p] = 1;
      }
    }
    current = refined;
  }
  return current;
}
