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
    { name: "Fashion", slug: "fashion", description: "Curated elegance for every moment", image: "/assets/categories/fashion.png", order: 1 },
    { name: "Sale", slug: "sale", description: "Exclusive promotions on selected pieces", image: "/assets/categories/sale.png", order: 2 },
    { name: "Casa", slug: "casa", description: "The art of living", image: "/assets/categories/casa.png", order: 3 },
    { name: "World", slug: "world", description: "A global perspective on style", image: "/assets/categories/world.png", order: 4 },
    { name: "MY AB", slug: "my-ab", description: "Your exclusive Aighis Byrca experience", image: "/assets/categories/my-ab.png", order: 5 },
    { name: "Summer Collection", slug: "summer-collection", description: "Lightness for the warm days ahead", image: "/assets/categories/summer-collection.png", order: 6 },
    { name: "Bags", slug: "bags", description: "Signature Collection", image: "/assets/categories/bags.png", order: 7 },
    { name: "Gifts", slug: "gifts", description: "Find the perfect present", image: "/assets/categories/gifts.png", order: 8 },
    { name: "New In", slug: "new-in", description: "The latest additions to our collection", image: "/assets/categories/new-in.png", order: 9 },
    { name: "Women", slug: "women", description: "Elegance redefined for her", image: "/assets/categories/women.png", order: 10 },
    { name: "Men", slug: "men", description: "Refined style for him", image: "/assets/categories/men.png", order: 11 },
    { name: "Collection", slug: "collection", description: "Signature pieces from our latest line", image: "/assets/categories/collection.png", order: 12 },
    { name: "Sportswear", slug: "sportswear", description: "Performance meets luxury", image: "/assets/categories/sportswear.png", order: 13 },
    { name: "Lingerie", slug: "lingerie", description: "Intimate elegance", image: "/assets/categories/lingerie.png", order: 14 },
    { name: "Tops", slug: "tops", description: "Shirts, blouses and more", image: "/assets/categories/tops.png", order: 15 },
    { name: "Bottoms", slug: "bottoms", description: "Pants, skirts and shorts", image: "/assets/categories/bottoms.png", order: 16 },
    { name: "Underwear", slug: "underwear", description: "Intimate Collection", image: "/assets/categories/underwear.png", order: 17 },
    { name: "Online Exclusive", slug: "online-exclusive", description: "Only available online", image: "/assets/categories/online-exclusive.png", order: 18 },
  ];

  for (const cat of categories) {
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

  // Orders
  const orders = [
    { id: 1, orderRef: "AB-1001", customerName: "Sarah Johnson", customerEmail: "sarah@example.com", customerPhone: "+216 50 123 456", address: "12 Rue de la Liberté", city: "Tunis", postalCode: "1000", paymentMethod: "D17", status: "Delivered", totalAmount: "420 Tnd" },
    { id: 2, orderRef: "AB-1002", customerName: "Ahmed Ben Ali", customerEmail: "ahmed@example.com", customerPhone: "+216 20 789 012", address: "5 Avenue Habib Bourguiba", city: "Sfax", postalCode: "3000", paymentMethod: "Bank Transfer", status: "Shipped", totalAmount: "120 Tnd" },
    { id: 3, orderRef: "AB-1003", customerName: "Maria Trabelsi", customerEmail: "maria@example.com", customerPhone: "+216 22 345 678", address: "8 Rue Mongi Slim", city: "Sousse", postalCode: "4000", paymentMethod: "Cash on Delivery", status: "Pending", totalAmount: "280 Tnd" },
    { id: 4, orderRef: "AB-1004", customerName: "Omar Meftah", customerEmail: "omar@example.com", customerPhone: "+216 98 765 432", address: "3 Rue Ibn Sina", city: "Tunis", postalCode: "1002", paymentMethod: "D17", status: "Pending", totalAmount: "650 Tnd" },
    { id: 5, orderRef: "AB-1005", customerName: "Leila Bouazizi", customerEmail: "leila@example.com", customerPhone: "+216 55 111 222", address: "15 Rue des Jardins", city: "Nabeul", postalCode: "8000", paymentMethod: "Cash on Delivery", status: "Delivered", totalAmount: "85 Tnd" },
    { id: 6, orderRef: "AB-1006", customerName: "Youssef Cherni", customerEmail: "youssef@example.com", customerPhone: "+216 71 333 444", address: "22 Avenue de la République", city: "Tunis", postalCode: "1001", paymentMethod: "D17", status: "Shipped", totalAmount: "510 Tnd", notes: "Please leave the package at the reception desk." },
    { id: 7, orderRef: "AB-1007", customerName: "Amira Bouchama", customerEmail: "amira@example.com", customerPhone: "+216 99 555 666", address: "10 Rue Habib Bourguiba", city: "Sousse", postalCode: "4000", paymentMethod: "Cash on Delivery", status: "Pending", totalAmount: "460 Tnd", notes: "Gift wrapping please, it's a birthday present." },
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: { orderRef: order.orderRef },
      update: {},
      create: order,
    });
  }

  // Order Items for orders 6 and 7
  const orderItems = [
    { orderId: 6, productId: 6, productName: "Tailored Blazer", productPrice: "280 Tnd", size: "M", quantity: 1 },
    { orderId: 6, productId: 12, productName: "Classic Belt", productPrice: "85 Tnd", size: "One Size", quantity: 1 },
    { orderId: 6, productId: 22, productName: "Linen Shorts", productPrice: "95 Tnd", size: "L", quantity: 1 },
    { orderId: 7, productId: 1, productName: "Silk Satin Dress", productPrice: "70 Tnd", size: "S", quantity: 1 },
    { orderId: 7, productId: 2, productName: "Coffee Capri Bag", productPrice: "140 Tnd", size: "One Size", quantity: 1 },
    { orderId: 7, productId: 17, productName: "Lace Bodysuit", productPrice: "90 Tnd", size: "M", quantity: 1 },
    { orderId: 7, productId: 16, productName: "Silk Pajama Set", productPrice: "160 Tnd", size: "S", quantity: 1 },
  ];

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
