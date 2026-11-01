import { PrismaClient } from "@/src/generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientConstructor: typeof PrismaClient | undefined;
};

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaClientConstructor !== PrismaClient
) {
  void globalForPrisma.prisma.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter: new PrismaLibSql({ url: "file:prisma/dev.db" }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClientConstructor = PrismaClient;
}
