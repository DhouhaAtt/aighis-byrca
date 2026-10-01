import type { CreateProductInput } from "./repositories/product.repository";

function toText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value === "true" || value === "1";
  }
  return false;
}

function toJsonList(value: unknown): string | null {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => (typeof item === "string" ? item.trim() : item))
      .filter((item) => item !== "" && item != null);
    return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
  }
  return toText(value);
}

export function isValidProductPayload(
  body: Record<string, unknown>
): boolean {
  return Boolean(
    toText(body.name) && toText(body.price) && toText(body.image)
  );
}

export interface VariantPayload {
  size: string;
  color: string;
  hex: string | null;
  stock: number;
}

/**
 * Returns null when the request carries no `variants` key, meaning the caller
 * should leave existing variants untouched.
 */
export function toVariantInputs(
  body: Record<string, unknown>
): VariantPayload[] | null {
  if (!("variants" in body)) return null;
  if (!Array.isArray(body.variants)) return [];

  const rows: VariantPayload[] = [];
  for (const entry of body.variants) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const size = toText(record.size);
    const color = toText(record.color);
    if (!size && !color) continue;

    rows.push({
      size: size ?? "",
      color: color ?? "",
      hex: toText(record.hex),
      stock: toNumber(record.stock) ?? 0,
    });
  }
  return rows;
}

export function toCreateProductInput(
  body: Record<string, unknown>
): CreateProductInput {
  return {
    name: toText(body.name) as string,
    price: toText(body.price) as string,
    originalPrice: toText(body.originalPrice),
    image: toText(body.image) as string,
    hoverImage: toText(body.hoverImage),
    gender: toText(body.gender)?.toLowerCase() ?? null,
    isOnSale: toBoolean(body.isOnSale),
    isNewArrival: toBoolean(body.isNewArrival),
    stock: toNumber(body.stock) ?? 0,
    tags: Array.isArray(body.tags)
      ? toJsonList(body.tags)
      : toText(body.tags),
    collection: toText(body.collection),
    description: toText(body.description),
    composition: toText(body.composition),
    fit: toText(body.fit),
    productCode: toText(body.productCode),
    careInstructions: toJsonList(body.careInstructions),
    images: toJsonList(body.images),
    colors: toJsonList(body.colors),
    sizes: toJsonList(body.sizes),
    shipping: toText(body.shipping),
    returns: toText(body.returns),
    categoryId: toNumber(body.categoryId),
  };
}