import "dotenv/config";
import fs from "node:fs";
import { PrismaClient } from "../src/generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { seedCategories } from "./categoriesData";

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
  for (const cat of seedCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { description: cat.description, image: cat.image, order: cat.order },
      create: cat,
    });
  }

  // Products
  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, name: "Silk Satin Dress", price: "70 Tnd", image: "/assets/products/product1.png", gender: "women", tags: "women,summer-collection,new-in,fashion,collection", categoryId: 1, stock: 25,
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
    create: { id: 2, name: "Coffee Capri Bag", price: "140 Tnd", image: "/assets/products/product2.png", gender: "women", tags: "women,summer-collection,new-in,fashion,gifts", categoryId: 4, collection: "Summer 2025", stock: 12, description: "A sophisticated crescent-shaped bag crafted from pebbled leather.", composition: "100% Calfskin Leather. Lining: 100% Suede.", fit: "Dimensions: 26 x 18 x 8 cm.", productCode: "AB2D3FS2O2HF6CK", careInstructions: JSON.stringify(["Wipe with soft dry cloth", "Avoid direct sunlight", "Store in dust bag"]), images: JSON.stringify(["/assets/products/product2.png"]), colors: JSON.stringify([{ name: "Coffee", hex: "#6f4e37" }, { name: "Black", hex: "#111" }]), sizes: JSON.stringify(["One Size"]), shipping: "Free shipping on all orders within Tunisia.", returns: "Free returns within 14 days of delivery." },
  });

  // Products 3-23
  const bulkProducts = [
    { id: 3, name: "Printed One-Piece Swimsuit", price: "45 Tnd", image: "/assets/products/product3.png", gender: "women", tags: "women,summer-collection,new-in,fashion,online-exclusive", categoryId: 3, collection: "Summer 2025", stock: 30 },
    { id: 4, name: "Cotton Mini Dress", price: "55 Tnd", image: "/assets/products/product4.png", gender: "women", tags: "women,summer-collection,new-in,fashion,collection", categoryId: 1, collection: "Summer 2025", stock: 18 },
    { id: 5, name: "Leather Crossbody Bag", price: "230 Tnd", originalPrice: "280 Tnd", image: "/assets/products/product1.png", gender: "women", isOnSale: true, tags: "women,sale,bags", categoryId: 4, collection: "Permanent", stock: 8 },
    { id: 6, name: "Tailored Blazer", price: "280 Tnd", image: "/assets/products/product2.png", gender: "women", tags: "women,collection,fashion,tops", categoryId: 1, collection: "Permanent", stock: 14 },
    { id: 7, name: "Cashmere Sweater", price: "180 Tnd", image: "/assets/products/product3.png", gender: "women", tags: "women,collection,fashion,tops", categoryId: 1, collection: "Permanent", stock: 10 },
    { id: 8, name: "Pleated Midi Skirt", price: "150 Tnd", image: "/assets/products/product4.png", gender: "women", tags: "women,collection,fashion,bottoms", categoryId: 2, collection: "Permanent", stock: 15 },
    { id: 9, name: "Linen Wide-leg Pants", price: "170 Tnd", originalPrice: "200 Tnd", image: "/assets/products/product1.png", gender: "women", isOnSale: true, tags: "women,sale,bottoms", categoryId: 2, collection: "Permanent", stock: 6 },
    { id: 10, name: "Wool Tailored Suit", price: "300 Tnd", image: "/assets/products/product2.png", gender: "men", tags: "men,collection,fashion,tops", categoryId: 1, collection: "Permanent", stock: 7 },
    { id: 11, name: "Leather Sneakers", price: "250 Tnd", image: "/assets/products/product3.png", gender: "men", tags: "men,collection,sportswear,bottoms", categoryId: 2, collection: "Permanent", stock: 20 },
    { id: 12, name: "Classic Belt", price: "85 Tnd", image: "/assets/products/product4.png", gender: "men", tags: "men,collection,gifts,bottoms", categoryId: 2, collection: "Permanent", stock: 35 },
    { id: 13, name: "Tailored Trousers", price: "200 Tnd", originalPrice: "250 Tnd", image: "/assets/products/product1.png", gender: "men", isOnSale: true, tags: "men,sale,bottoms", categoryId: 2, collection: "Permanent", stock: 11 },
    { id: 14, name: "Cashmere Turtleneck", price: "195 Tnd", image: "/assets/products/product2.png", gender: "women", tags: "women,collection,tops", categoryId: 1, collection: "Permanent", stock: 9 },
    { id: 15, name: "Wool-blend Coat", price: "290 Tnd", image: "/assets/products/product3.png", gender: "women", tags: "women,collection,tops", categoryId: 1, collection: "Permanent", stock: 5 },
    { id: 16, name: "Silk Pajama Set", price: "160 Tnd", image: "/assets/products/product4.png", gender: "women", tags: "women,collection,underwear", categoryId: 3, collection: "Permanent", stock: 13 },
    { id: 17, name: "Lace Bodysuit", price: "90 Tnd", image: "/assets/products/product1.png", gender: "women", tags: "women,lingerie,underwear", categoryId: 3, collection: "Permanent", stock: 22 },
    { id: 18, name: "Cotton Hoodie", price: "110 Tnd", image: "/assets/products/product2.png", gender: "men", tags: "men,collection,sportswear,tops", categoryId: 1, collection: "Permanent", stock: 16 },
    { id: 19, name: "Technical Track Pants", price: "130 Tnd", image: "/assets/products/product3.png", gender: "men", tags: "men,collection,sportswear,bottoms", categoryId: 2, collection: "Permanent", stock: 19 },
    { id: 20, name: "Leather Messenger Bag", price: "260 Tnd", image: "/assets/products/product4.png", gender: "men", tags: "men,collection,bags", categoryId: 4, collection: "Permanent", stock: 4 },
    { id: 21, name: "Silk Tie & Pocket Square Set", price: "75 Tnd", image: "/assets/products/product1.png", gender: "men", tags: "men,gifts,bottoms", categoryId: 2, collection: "Permanent", stock: 28 },
    { id: 22, name: "Linen Shorts", price: "95 Tnd", image: "/assets/products/product2.png", gender: "men", tags: "men,collection,bottoms", categoryId: 2, collection: "Permanent", stock: 24 },
    { id: 23, name: "Merino Cardigan", price: "140 Tnd", image: "/assets/products/product3.png", gender: "women", tags: "women,collection,tops", categoryId: 1, collection: "Permanent", stock: 11 },
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
        stock: (p as any).stock ?? 0,
        tags: p.tags,
        collection: p.collection,
        categoryId: p.categoryId,
      },
    });
  }

  // Orders: a single demo order so the admin dashboard has something to show.
  // Real orders are created through POST /api/orders.
  const orders = [
    { orderRef: "AB-1007", customerName: "Amira Bouchama", customerEmail: "amira@example.com", customerPhone: "+216 99 555 666", address: "10 Rue Habib Bourguiba", city: "Sousse", postalCode: "4000", paymentMethod: "Cash on Delivery", status: "Pending", totalAmount: "460 Tnd", notes: "Gift wrapping please, it's a birthday present." },
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: { orderRef: order.orderRef },
      update: {},
      create: {
        ...order,
        events: { create: { status: order.status, note: "Order placed" } },
      },
    });
  }

  // Drop any leftover demo orders from previous seeds.
  await prisma.order.deleteMany({
    where: { orderRef: { notIn: orders.map((order) => order.orderRef) } },
  });

  // Order Items for the demo order
  const demoOrder = await prisma.order.findUnique({
    where: { orderRef: "AB-1007" },
  });

  const orderItems = demoOrder
    ? [
        { orderId: demoOrder.id, productId: 1, productName: "Silk Satin Dress", productPrice: "70 Tnd", size: "S", quantity: 1 },
        { orderId: demoOrder.id, productId: 2, productName: "Coffee Capri Bag", productPrice: "140 Tnd", size: "One Size", quantity: 1 },
        { orderId: demoOrder.id, productId: 17, productName: "Lace Bodysuit", productPrice: "90 Tnd", size: "M", quantity: 1 },
        { orderId: demoOrder.id, productId: 16, productName: "Silk Pajama Set", productPrice: "160 Tnd", size: "S", quantity: 1 },
      ]
    : [];

  for (const item of orderItems) {
    const existing = await prisma.orderItem.findFirst({
      where: { orderId: item.orderId, productName: item.productName },
    });
    if (!existing) {
      await prisma.orderItem.create({ data: item });
    }
  }

  console.log("Seed completed successfully.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
