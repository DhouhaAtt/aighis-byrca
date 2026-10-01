import { connection } from "next/server";

import { productRepository } from "./repositories/product.repository";
import { categoryRepository } from "./repositories/category.repository";
import {
  parseCareInstructions,
  parseColors,
  parseImages,
  parseSizes,
  parseTags,
} from "./productJson";
import type { Product } from "../components/NewArrivals/products";

export {
  parseCareInstructions,
  parseColors,
  parseImages,
  parseSizes,
  parseTags,
} from "./productJson";

export {
  getCategoryLabel,
  toStorefrontProduct,
  type ProductDetailRow,
  type ProductRow,
} from "./productMapper";

import { toStorefrontProduct, type ProductDetailRow, type ProductRow } from "./productMapper";
import { getFallbackRows } from "./productFallback";

/**
 * Reads products from the database and falls back to the bundled catalogue if
 * the database is unavailable, so the storefront always renders.
 */
async function fetchRows(): Promise<ProductRow[]> {
  try {
    await connection();
    const rows = await productRepository.findAll();
    if (rows.length > 0) return rows;
  } catch (error) {
    console.error("[storefront] database unavailable, using fallback", error);
  }

  return getFallbackRows();
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await fetchRows();
  return rows.map(toStorefrontProduct);
}

export async function getNewArrivals(): Promise<Product[]> {
  const rows = await fetchRows();
  return rows
    .filter((row) => row.isNewArrival)
    .map(toStorefrontProduct);
}

export async function getProductsByGender(
  gender: "women" | "men"
): Promise<Product[]> {
  const rows = await fetchRows();
  return rows
    .filter(
      (row) =>
        row.gender?.toLowerCase() === gender || row.gender?.toLowerCase() === "unisex"
    )
    .map(toStorefrontProduct);
}

export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  const rows = await fetchRows();
  const target = slug.toLowerCase();

  return rows
    .filter((row) => {
      if (row.category?.slug.toLowerCase() === target) return true;
      return parseTags(row.tags).includes(target);
    })
    .map(toStorefrontProduct);
}

export async function getProductById(
  id: number
): Promise<ProductDetailRow | null> {
  try {
    await connection();
    const product = await productRepository.findById(id);
    if (product) return product;
  } catch (error) {
    console.error("[storefront] database unavailable, using fallback", error);
  }

  return getFallbackRows().find((row) => row.id === id) ?? null;
}

export async function getRelatedProducts(
  id: number,
  limit = 4
): Promise<Product[]> {
  const rows = await fetchRows();
  const current = rows.find((row) => row.id === id);
  const slug = current?.category?.slug;

  const sameCategory = slug
    ? rows.filter((row) => row.category?.slug === slug)
    : [];
  const pool = sameCategory.length > 1 ? sameCategory : rows;

  return pool
    .filter((row) => row.id !== id)
    .slice(0, limit)
    .map(toStorefrontProduct);
}

export interface StorefrontCategory {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
}

export async function getCategoryBySlug(
  slug: string
): Promise<StorefrontCategory | null> {
  try {
    await connection();
    const category = await categoryRepository.findBySlug(slug);
    if (category) {
      return {
        slug: category.slug,
        name: category.name,
        description: category.description ?? null,
        image: category.image ?? null,
      };
    }
  } catch (error) {
    console.error("[storefront] database unavailable, using fallback", error);
  }

  const match = getFallbackRows().find(
    (row) => row.category?.slug === slug.toLowerCase()
  );

  return match?.category
    ? {
        slug: match.category.slug,
        name: match.category.name,
        description: null,
        image: null,
      }
    : null;
}
