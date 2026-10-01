export const DEFAULT_VARIANT_SIZE = "One Size";
export const DEFAULT_VARIANT_COLOR = "Default";

function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function parseTags(value: string | null | undefined): string[] {
  if (!value) return [];
  const asJson = parseJson<string[]>(value);
  const list = Array.isArray(asJson) ? asJson : value.split(",");
  return list
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean);
}

export function parseSizes(value: string | null | undefined): string[] {
  const asJson = parseJson<string[]>(value);
  if (Array.isArray(asJson)) return asJson.filter(Boolean).map(String);
  if (!value) return [];
  return value
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}

export interface ColorOption {
  name: string;
  hex: string;
}

export function parseColors(value: string | null | undefined): ColorOption[] {
  const asJson = parseJson<ColorOption[]>(value);
  if (!Array.isArray(asJson)) return [];
  return asJson.filter((color) => color && color.hex);
}

export function parseImages(value: string | null | undefined): string[] {
  const asJson = parseJson<string[]>(value);
  if (Array.isArray(asJson)) return asJson.filter(Boolean).map(String);
  if (!value) return [];
  return value
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean);
}

export function parseCareInstructions(
  value: string | null | undefined
): string[] {
  const asJson = parseJson<string[]>(value);
  if (Array.isArray(asJson)) return asJson.filter(Boolean).map(String);
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
