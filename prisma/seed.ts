import "dotenv/config";
import fs from "node:fs";
import { PrismaClient } from "../src/generated/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const DB_URL = "file:prisma/dev.db";
const MIGRATION_SQL = "prisma/migrations/20260709213136_init/migration.sql";

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

async function main() {
  await ensureMigration();

  const adapter = new PrismaLibSql({ url: DB_URL });
  const prisma = new PrismaClient({ adapter });

  // Admin user
  await prisma.user.upsert({
    where: { email: "amore@aighis.com" },
    update: {},
    create: {
      email: "amore@aighis.com",
      password: "doukhaameur",
      name: "Amor Aighis",
      role: "admin",
    },
  });

  // Categories
  const categories = [
    { name: "Tops", slug: "tops" },
    { name: "Bottoms", slug: "bottoms" },
    { name: "Underwear", slug: "underwear" },
    { name: "Bags", slug: "bags" },
    { name: "Summer Collection", slug: "summer-collection" },
    { name: "Gifts", slug: "gifts" },
    { name: "New In", slug: "new-in" },
    { name: "Fashion", slug: "fashion" },
    { name: "Women", slug: "women" },
    { name: "Men", slug: "men" },
    { name: "Collection", slug: "collection" },
    { name: "Sportswear", slug: "sportswear" },
    { name: "Lingerie", slug: "lingerie" },
    { name: "Casa", slug: "casa" },
    { name: "World", slug: "world" },
    { name: "Sale", slug: "sale" },
    { name: "MY AB", slug: "my-ab" },
    { name: "Online Exclusive", slug: "online-exclusive" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Products
  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, name: "Silk Satin Dress", price: "70 Tnd", image: "/assets/products/product1.png", gender: "women", tags: "women,summer-collection,new-in,fashion,collection", categoryId: 1,
      description: "A refined silk satin dress with a fluid silhouette.", composition: "100% Silk Satin. Lining: 100% Cupro.", fit: "Regular fit. The model is 178 cm and wears a size S.", productCode: "AB1D3FS1O1HF6CK",
      careInstructions: JSON.stringify(["Dry clean only", "Do not bleach", "Iron at low temperature", "Do not tumble dry"]),
      images: JSON.stringify(["/assets/products/product1.png", "/assets/products/product1.png"]),
      colors: JSON.stringify([{ name: "Black", hex: "#111" }, { name: "Ivory", hex: "#f5f0e8" }]),
      sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
      shipping: "Free shipping on all orders within Tunisia. Delivery within 2-4 business days.", returns: "Free returns within 14 days of delivery.",
      collection: "Summer 2025",
    },
  });

  // Product 2
  await prisma.product.upsert({
    where: { id: 2 }, update: {},
    create: { id: 2, name: "Coffee Capri Bag", price: "140 Tnd", image: "/assets/products/product2.png", gender: "women", tags: "women,summer-collection,new-in,fashion,gifts", categoryId: 4, collection: "Summer 2025", description: "A sophisticated crescent-shaped bag crafted from pebbled leather.", composition: "100% Calfskin Leather. Lining: 100% Suede.", fit: "Dimensions: 26 x 18 x 8 cm.", productCode: "AB2D3FS2O2HF6CK", careInstructions: JSON.stringify(["Wipe with soft dry cloth", "Avoid direct sunlight", "Store in dust bag"]), images: JSON.stringify(["/assets/products/product2.png"]), colors: JSON.stringify([{ name: "Coffee", hex: "#6f4e37" }, { name: "Black", hex: "#111" }]), sizes: JSON.stringify(["One Size"]), shipping: "Free shipping on all orders within Tunisia.", returns: "Free returns within 14 days of delivery." },
  });

  // Products 3-22 (abbreviated - using direct SQL for bulk)
  const bulkProducts = [
    { id: 3, name: "Printed One-Piece Swimsuit", price: "45 Tnd", image: "/assets/products/product3.png", gender: "women", tags: "women,summer-collection,new-in,fashion,online-exclusive", categoryId: 3, collection: "Summer 2025" },
    { id: 4, name: "Cotton Mini Dress", price: "55 Tnd", image: "/assets/products/product4.png", gender: "women", tags: "women,summer-collection,new-in,fashion,collection", categoryId: 1, collection: "Summer 2025" },
    { id: 5, name: "Leather Crossbody Bag", price: "230 Tnd", originalPrice: "280 Tnd", image: "/assets/products/product1.png", gender: "women", isOnSale: true, tags: "women,sale,bags", categoryId: 4, collection: "Permanent" },
    { id: 6, name: "Tailored Blazer", price: "280 Tnd", image: "/assets/products/product2.png", gender: "women", tags: "women,collection,fashion,tops", categoryId: 1, collection: "Permanent" },
    { id: 7, name: "Cashmere Sweater", price: "180 Tnd", image: "/assets/products/product3.png", gender: "women", tags: "women,collection,fashion,tops", categoryId: 1, collection: "Permanent" },
    { id: 8, name: "Pleated Midi Skirt", price: "150 Tnd", image: "/assets/products/product4.png", gender: "women", tags: "women,collection,fashion,bottoms", categoryId: 2, collection: "Permanent" },
    { id: 9, name: "Linen Wide-leg Pants", price: "170 Tnd", originalPrice: "200 Tnd", image: "/assets/products/product1.png", gender: "women", isOnSale: true, tags: "women,sale,bottoms", categoryId: 2, collection: "Permanent" },
    { id: 10, name: "Wool Tailored Suit", price: "300 Tnd", image: "/assets/products/product2.png", gender: "men", tags: "men,collection,fashion,tops", categoryId: 1, collection: "Permanent" },
    { id: 11, name: "Leather Sneakers", price: "250 Tnd", image: "/assets/products/product3.png", gender: "men", tags: "men,collection,sportswear,bottoms", categoryId: 2, collection: "Permanent" },
    { id: 12, name: "Classic Belt", price: "85 Tnd", image: "/assets/products/product4.png", gender: "men", tags: "men,collection,gifts,bottoms", categoryId: 2, collection: "Permanent" },
    { id: 13, name: "Tailored Trousers", price: "200 Tnd", originalPrice: "250 Tnd", image: "/assets/products/product1.png", gender: "men", isOnSale: true, tags: "men,sale,bottoms", categoryId: 2, collection: "Permanent" },
    { id: 14, name: "Cashmere Turtleneck", price: "195 Tnd", image: "/assets/products/product2.png", gender: "women", tags: "women,collection,tops", categoryId: 1, collection: "Permanent" },
    { id: 15, name: "Wool-blend Coat", price: "290 Tnd", image: "/assets/products/product3.png", gender: "women", tags: "women,collection,tops", categoryId: 1, collection: "Permanent" },
    { id: 16, name: "Silk Pajama Set", price: "160 Tnd", image: "/assets/products/product4.png", gender: "women", tags: "women,collection,underwear", categoryId: 3, collection: "Permanent" },
    { id: 17, name: "Lace Bodysuit", price: "90 Tnd", image: "/assets/products/product1.png", gender: "women", tags: "women,lingerie,underwear", categoryId: 3, collection: "Permanent" },
    { id: 18, name: "Cotton Hoodie", price: "110 Tnd", image: "/assets/products/product2.png", gender: "men", tags: "men,collection,sportswear,tops", categoryId: 1, collection: "Permanent" },
    { id: 19, name: "Technical Track Pants", price: "130 Tnd", image: "/assets/products/product3.png", gender: "men", tags: "men,collection,sportswear,bottoms", categoryId: 2, collection: "Permanent" },
    { id: 20, name: "Leather Messenger Bag", price: "260 Tnd", image: "/assets/products/product4.png", gender: "men", tags: "men,collection,bags", categoryId: 4, collection: "Permanent" },
    { id: 21, name: "Silk Tie & Pocket Square Set", price: "75 Tnd", image: "/assets/products/product1.png", gender: "men", tags: "men,gifts,bottoms", categoryId: 2, collection: "Permanent" },
    { id: 22, name: "Linen Shorts", price: "95 Tnd", image: "/assets/products/product2.png", gender: "men", tags: "men,collection,bottoms", categoryId: 2, collection: "Permanent" },
    { id: 23, name: "Merino Cardigan", price: "140 Tnd", image: "/assets/products/product3.png", gender: "women", tags: "women,collection,tops", categoryId: 1, collection: "Permanent" },
  ];

  for (const p of bulkProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: (p as any).originalPrice ?? null,
        image: p.image,
        gender: p.gender,
        isOnSale: (p as any).isOnSale ?? false,
        tags: p.tags,
        collection: p.collection,
        categoryId: p.categoryId,
      },
    });
  }

  // Orders
  const orders = [
    { id: 1, orderRef: "AB-1001", customerName: "Sarah Johnson", customerEmail: "sarah@example.com", customerPhone: "+216 50 123 456", address: "12 Rue de la Liberté", city: "Tunis", postalCode: "1000", paymentMethod: "D17", status: "Delivered", totalAmount: "420 Tnd" },
    { id: 2, orderRef: "AB-1002", customerName: "Ahmed Ben Ali", customerEmail: "ahmed@example.com", customerPhone: "+216 20 789 012", address: "5 Avenue Habib Bourguiba", city: "Sfax", postalCode: "3000", paymentMethod: "Bank Transfer", status: "Shipped", totalAmount: "120 Tnd" },
    { id: 3, orderRef: "AB-1003", customerName: "Maria Trabelsi", customerEmail: "maria@example.com", customerPhone: "+216 22 345 678", address: "8 Rue Mongi Slim", city: "Sousse", postalCode: "4000", paymentMethod: "Cash on Delivery", status: "Pending", totalAmount: "280 Tnd" },
    { id: 4, orderRef: "AB-1004", customerName: "Omar Meftah", customerEmail: "omar@example.com", customerPhone: "+216 98 765 432", address: "3 Rue Ibn Sina", city: "Tunis", postalCode: "1002", paymentMethod: "D17", status: "Pending", totalAmount: "650 Tnd" },
    { id: 5, orderRef: "AB-1005", customerName: "Leila Bouazizi", customerEmail: "leila@example.com", customerPhone: "+216 55 111 222", address: "15 Rue des Jardins", city: "Nabeul", postalCode: "8000", paymentMethod: "Cash on Delivery", status: "Delivered", totalAmount: "85 Tnd" },
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: { orderRef: order.orderRef },
      update: {},
      create: order,
    });
  }

  console.log("Seed completed successfully.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
