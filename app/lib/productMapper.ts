import { parseColors, parseSizes, parseTags } from "./productJson";
import type { Product } from "../components/NewArrivals/products";

/**
 * Pure, client-safe mapping from a database row to a storefront product.
 * Kept separate from `storefrontProducts` because that module imports
 * `next/server` for dynamic rendering and cannot run in the browser.
 */

export interface ProductRow {
  id: number;
  name: string;
  price: string;
  originalPrice: string | null;
  image: string;
  hoverImage: string | null;
  gender: string | null;
  isOnSale: boolean;
  isNewArrival: boolean;
  stock: number;
  tags: string | null;
  collection: string | null;
  description: string | null;
  composition: string | null;
  fit: string | null;
  productCode: string | null;
  careInstructions: string | null;
  images: string | null;
  colors: string | null;
  sizes: string | null;
  shipping: string | null;
  returns: string | null;
  categoryId: number | null;
  category: { id: number; name: string; slug: string } | null;
}

export interface ProductDetailRow extends ProductRow {
  createdAt?: Date;
  updatedAt?: Date;
}

const DEFAULT_CATEGORY_LABEL = "NEW COLLECTION";

export function getCategoryLabel(row: ProductRow): string {
  return row.category?.name?.toUpperCase() || DEFAULT_CATEGORY_LABEL;
}

export function toStorefrontProduct(row: ProductRow): Product {
  const gender =
    row.gender === "women" || row.gender === "men" || row.gender === "unisex"
      ? row.gender
      : undefined;

  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: getCategoryLabel(row),
    image: row.image,
    hoverImage: row.hoverImage ?? undefined,
    isOnSale: row.isOnSale,
    originalPrice: row.originalPrice ?? undefined,
    gender,
    tags: parseTags(row.tags),
    sizes: parseSizes(row.sizes),
    colors: parseColors(row.colors),
  };
}
