export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Lab {
  L: number;
  a: number;
  b: number;
}

const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i += 1) {
  const value = i / 255;
  SRGB_TO_LINEAR[i] =
    value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

const WHITE_X = 0.95047;
const WHITE_Y = 1;
const WHITE_Z = 1.08883;

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace(/^#/, "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return { r, g, b };
    }
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return { r, g, b };
    }
  }
  return { r: 17, g: 17, b: 17 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (value: number) =>
    Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function pivotXyz(value: number): number {
  return value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
}

export function rgbToLab(r: number, g: number, b: number): Lab {
  const linearR = SRGB_TO_LINEAR[clamp(Math.round(r), 0, 255)];
  const linearG = SRGB_TO_LINEAR[clamp(Math.round(g), 0, 255)];
  const linearB = SRGB_TO_LINEAR[clamp(Math.round(b), 0, 255)];

  const x = (linearR * 0.4124564 + linearG * 0.3575761 + linearB * 0.1804375) / WHITE_X;
  const y = (linearR * 0.2126729 + linearG * 0.7151522 + linearB * 0.072175) / WHITE_Y;
  const z = (linearR * 0.0193339 + linearG * 0.119192 + linearB * 0.9503041) / WHITE_Z;

  const fx = pivotXyz(x);
  const fy = pivotXyz(y);
  const fz = pivotXyz(z);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function labToRgb(lab: Lab): RGB {
  const fy = (lab.L + 16) / 116;
  const fx = fy + lab.a / 500;
  const fz = fy - lab.b / 200;

  const x = WHITE_X * Math.pow(fx, 3);
  const y = WHITE_Y * Math.pow(fy, 3);
  const z = WHITE_Z * Math.pow(fz, 3);

  const linearR = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  const linearG = x * -0.969266 + y * 1.8760108 + z * 0.041556;
  const linearB = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  const toSrgb = (value: number) => {
    const clamped = clamp(value, 0, 1);
    const srgb =
      clamped <= 0.0031308
        ? 12.92 * clamped
        : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return Math.round(clamp(srgb * 255, 0, 255));
  };

  return { r: toSrgb(linearR), g: toSrgb(linearG), b: toSrgb(linearB) };
}

export function rgbToLabFromRgb(rgb: RGB): Lab {
  return rgbToLab(rgb.r, rgb.g, rgb.b);
}

export function hexColorDistance(hexA: string, hexB: string): number {
  const a = rgbToLabFromRgb(hexToRgb(hexA));
  const b = rgbToLabFromRgb(hexToRgb(hexB));
  const dL = a.L - b.L;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

export function colorDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function averageColor(
  data: Uint8ClampedArray,
  mask: Uint8ClampedArray | null,
  step = 1
): RGB | null {
  let r = 0;
  let g = 0;
  let b = 0;
  let weight = 0;

  for (let i = 0; i < data.length; i += 4 * step) {
    const coverage = mask ? mask[i + 3] / 255 : 1;
    if (coverage <= 0.05) continue;
    r += data[i] * coverage;
    g += data[i + 1] * coverage;
    b += data[i + 2] * coverage;
    weight += coverage;
  }

  if (weight === 0) return null;
  return { r: r / weight, g: g / weight, b: b / weight };
}
