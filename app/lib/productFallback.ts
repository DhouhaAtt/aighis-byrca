import { allProducts } from "../components/NewArrivals/products";
import { productDetails } from "./productData";
import type { ProductRow } from "./productMapper";

/**
 * Database-free product source.
 *
 * The storefront must never show an error page, so every read falls back to
 * these rows when the database is unreachable (for example on a read-only or
 * ephemeral host). The shape mirrors `ProductRow` so the same mapper is used
 * for both sources.
 */

const DEFAULT_STOCK = 10;

const CATEGORY_NAME_BY_LABEL: Record<string, string> = {
  "NEW COLLECTION": "New Arrivals",
  WOMEN: "Women",
  MEN: "Men",
  UNISEX: "Unisex",
  TOPS: "Tops",
  BOTTOMS: "Bottoms",
  UNDERWEAR: "Underwear",
  LINGERIE: "Lingerie",
  ACCESSORIES: "Accessories",
  FASHION: "Fashion",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toJson(value: unknown): string | null {
  if (Array.isArray(value)) {
    return value.length > 0 ? JSON.stringify(value) : null;
  }
  if (typeof value === "string" && value.trim() !== "") return value;
  return null;
}

let cached: ProductRow[] | null = null;

export function getFallbackRows(): ProductRow[] {
  if (cached) return cached;

  cached = allProducts.map((product) => {
    const detail = productDetails.find((item) => item.id === product.id);
    const label = (product.category ?? "NEW COLLECTION").toUpperCase();
    const name = CATEGORY_NAME_BY_LABEL[label] ?? "New Arrivals";

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.image,
      hoverImage: product.hoverImage ?? null,
      gender: product.gender ?? null,
      isOnSale: Boolean(product.isOnSale),
      isNewArrival: true,
      stock: DEFAULT_STOCK,
      tags: toJson(product.tags ?? []),
      collection: detail?.collection ?? null,
      description: detail?.description ?? null,
      composition: detail?.composition ?? null,
      fit: detail?.fit ?? null,
      productCode: detail?.productCode ?? null,
      careInstructions: toJson(detail?.careInstructions ?? []),
      images: toJson(detail?.images ?? [product.image]),
      colors: toJson(product.colors ?? detail?.colors ?? []),
      sizes: toJson(product.sizes ?? detail?.sizes ?? []),
      shipping: detail?.shipping ?? null,
      returns: detail?.returns ?? null,
      categoryId: null,
      category: { id: 0, name, slug: slugify(name) },
    } satisfies ProductRow;
  });

  return cached;
}
