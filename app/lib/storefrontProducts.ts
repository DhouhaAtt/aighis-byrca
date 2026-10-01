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
