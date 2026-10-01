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

async function fetchRows(): Promise<ProductRow[]> {
  await connection();
  return productRepository.findAll();
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
  await connection();
  return productRepository.findById(id);
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
  await connection();
  const category = await categoryRepository.findBySlug(slug);
  if (!category) return null;
  return {
    slug: category.slug,
    name: category.name,
    description: category.description ?? null,
    image: category.image ?? null,
  };
}
