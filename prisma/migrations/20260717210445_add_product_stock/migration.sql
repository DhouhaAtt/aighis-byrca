-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "originalPrice" TEXT,
    "image" TEXT NOT NULL,
    "hoverImage" TEXT,
    "gender" TEXT,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "collection" TEXT,
    "description" TEXT,
    "composition" TEXT,
    "fit" TEXT,
    "productCode" TEXT,
    "careInstructions" TEXT,
    "images" TEXT,
    "colors" TEXT,
    "sizes" TEXT,
    "shipping" TEXT,
    "returns" TEXT,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("careInstructions", "categoryId", "collection", "colors", "composition", "createdAt", "description", "fit", "gender", "hoverImage", "id", "image", "images", "isOnSale", "name", "originalPrice", "price", "productCode", "returns", "shipping", "sizes", "tags", "updatedAt") SELECT "careInstructions", "categoryId", "collection", "colors", "composition", "createdAt", "description", "fit", "gender", "hoverImage", "id", "image", "images", "isOnSale", "name", "originalPrice", "price", "productCode", "returns", "shipping", "sizes", "tags", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
