import "dotenv/config";
import fs from "node:fs";

import { PrismaClient } from "../src/generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

import { allProducts } from "../app/components/NewArrivals/products";
import { productDetails } from "../app/lib/productData";
import { toCreateProductInput } from "../app/lib/productPayload";
import {
  LABEL_TO_CATEGORY_SLUG,
  seedCategories,
} from "./categoriesData";

const DB_URL = "file:prisma/dev.db";
const MIGRATION_SQL = "prisma/migrations/20260709213136_init/migration.sql";
const DEFAULT_STOCK = 10;

const shouldUpdate = process.argv.includes("--update");
const flagOnly = process.argv.includes("--flag-new-arrivals");

async function ensureMigration() {
  const sql = createClient({ url: DB_URL });
  try {
    const tables = await sql.execute(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    if (tables.rows.length === 0) {
      const migrationSql = fs.readFileSync(MIGRATION_SQL, "utf-8");
      const statements = migrationSql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await sql.execute(stmt + ";");
      }
      console.log("Migration applied.");
    }
  } finally {
    sql.close();
  }
}

function resolveCategorySlug(
  label: string,
  tags: string[]
): string | null {
  const fromLabel = LABEL_TO_CATEGORY_SLUG[label.toUpperCase()];
  if (fromLabel) return fromLabel;

  const known = new Set(seedCategories.map((category) => category.slug));
  const match = tags.find((tag) => known.has(tag));
  return match ?? null;
}

async function main() {
  await ensureMigration();

  const adapter = new PrismaLibSql({ url: DB_URL });
  const prisma = new PrismaClient({ adapter });

  for (const category of seedCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { description: category.description, image: category.image, order: category.order },
      create: category,
    });
  }

  const categories = await prisma.category.findMany();
  const categoryIdBySlug = new Map(
    categories.map((category) => [category.slug, category.id])
  );

  const existing = await prisma.product.findMany({
    select: { id: true, name: true },
  });
  const existingByName = new Map(
    existing.map((product) => [product.name.trim().toLowerCase(), product.id])
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let flagged = 0;
  let missing = 0;

  for (const product of allProducts) {
    const detail = productDetails.find((item) => item.id === product.id);
    const tags = product.tags ?? [];
    const slug = resolveCategorySlug(product.category, tags);
    const categoryId = slug ? categoryIdBySlug.get(slug) ?? null : null;

    const payload = {
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.image,
      gender: product.gender ?? null,
      isOnSale: Boolean(product.isOnSale),
      isNewArrival: true,
      stock: DEFAULT_STOCK,
      tags,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      collection: detail?.collection ?? null,
      description: detail?.description ?? null,
      composition: detail?.composition ?? null,
      fit: detail?.fit ?? null,
      productCode: detail?.productCode ?? null,
      careInstructions: detail?.careInstructions ?? [],
      images: detail?.images ?? [product.image],
      shipping: detail?.shipping ?? null,
      returns: detail?.returns ?? null,
      categoryId,
    };

    const key = product.name.trim().toLowerCase();
    const existingId = existingByName.get(key);

    if (flagOnly) {
      if (existingId === undefined) {
        missing += 1;
        continue;
      }
      await prisma.product.update({
        where: { id: existingId },
        data: { isNewArrival: true },
      });
      flagged += 1;
      continue;
    }

    if (existingId !== undefined) {
      if (!shouldUpdate) {
        skipped += 1;
        continue;
      }
      await prisma.product.update({
        where: { id: existingId },
        data: toCreateProductInput(payload),
      });
      updated += 1;
      continue;
    }

    const createdProduct = await prisma.product.create({
      data: toCreateProductInput(payload),
    });
    existingByName.set(key, createdProduct.id);
    created += 1;
  }

  if (flagOnly) {
    console.log(
      `New Arrivals flag applied. Flagged: ${flagged}, Missing from DB: ${missing}.`
    );
    await prisma.$disconnect();
    return;
  }

  console.log(
    `Constants products synced. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}.`
  );
  if (!shouldUpdate && skipped > 0) {
    console.log("Run with --update to also refresh products that already exist.");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});