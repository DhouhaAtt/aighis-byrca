import { variantRepository } from "../app/lib/repositories/variant.repository";
import { prisma } from "../app/lib/prisma";

async function main() {
  const result = await variantRepository.backfillMissing();
  console.log(
    `Variant backfill complete. Products touched: ${result.productsTouched}, variants created: ${result.variantsCreated}.`
  );

  const totals = await prisma.productVariant.aggregate({
    _count: { id: true },
    _sum: { stock: true },
  });
  console.log(
    `Total variants: ${totals._count.id}, total stock units: ${totals._sum.stock ?? 0}.`
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
