import { prisma } from "../prisma";
import {
  parseColors,
  parseSizes,
  DEFAULT_VARIANT_SIZE,
  DEFAULT_VARIANT_COLOR,
} from "../productJson";

export const DEFAULT_VARIANT_STOCK = 10;

export interface VariantInput {
  size: string;
  color: string;
  hex?: string | null;
  stock: number;
}

export interface VariantWithProduct extends VariantInput {
  id: number;
  productId: number;
}

function normalize(value: string): string {
  return value.trim();
}

/**
 * Keeps Product.stock as the sum of its variants so existing storefront and
 * admin listings stay correct without changing every query.
 */
export async function recalculateProductStock(productId: number): Promise<number> {
  const aggregate = await prisma.productVariant.aggregate({
    where: { productId },
    _sum: { stock: true },
  });

  const total = aggregate._sum.stock ?? 0;
  await prisma.product.update({ where: { id: productId }, data: { stock: total } });
  return total;
}

export const variantRepository = {
  async findByProduct(productId: number) {
    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: [{ size: "asc" }, { color: "asc" }],
    });
  },

  async findById(id: number) {
    return prisma.productVariant.findUnique({ where: { id } });
  },

  /**
   * Replaces the variant set of a product with the given combinations.
   * Variants that disappear are removed, existing ones keep their stock.
   */
  async sync(productId: number, variants: VariantInput[]): Promise<VariantWithProduct[]> {
    const desired = new Map<string, VariantInput>();
    for (const variant of variants) {
      const size = normalize(variant.size);
      const color = normalize(variant.color);
      if (!size && !color) continue;
      desired.set(`${size}::${color}`, {
        size: size || DEFAULT_VARIANT_SIZE,
        color: color || DEFAULT_VARIANT_COLOR,
        hex: variant.hex ?? null,
        stock: Math.max(0, Math.trunc(variant.stock) || 0),
      });
    }

    const existing = await prisma.productVariant.findMany({ where: { productId } });
    const existingByKey = new Map(
      existing.map((v) => [`${v.size}::${v.color}`, v])
    );

    const toCreate = [...desired.values()].filter(
      (v) => !existingByKey.has(`${v.size}::${v.color}`)
    );
    const toUpdate = [...desired.values()].filter((v) => {
      const current = existingByKey.get(`${v.size}::${v.color}`);
      return current && (current.stock !== v.stock || current.hex !== v.hex);
    });
    const keep = new Set([...desired.keys()]);
    const toDelete = existing.filter((v) => !keep.has(`${v.size}::${v.color}`));

    const updatesToApply = toUpdate
      .map((v) => existingByKey.get(`${v.size}::${v.color}`))
      .filter((v): v is (typeof existing)[number] => Boolean(v))
      .map((current, index) => {
        const next = toUpdate[index];
        return prisma.productVariant.update({
          where: { id: current.id },
          data: { stock: next.stock, hex: next.hex },
        });
      });

    await prisma.$transaction([
      ...toDelete.map((v) => prisma.productVariant.delete({ where: { id: v.id } })),
      ...updatesToApply,
      ...toCreate.map((v) =>
        prisma.productVariant.create({
          data: { productId, size: v.size, color: v.color, hex: v.hex, stock: v.stock },
        })
      ),
    ]);

    await recalculateProductStock(productId);

    return this.findByProduct(productId);
  },

  /**
   * Creates variants for every product that has none yet, based on the sizes
   * and colors already stored on the product row.
   */
  async backfillMissing(defaultStock = DEFAULT_VARIANT_STOCK) {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sizes: true,
        colors: true,
        _count: { select: { variants: true } },
      },
    });

    let created = 0;
    let productsTouched = 0;

    for (const product of products) {
      if (product._count.variants > 0) continue;

      const sizes = parseSizes(product.sizes);
      const colors = parseColors(product.colors);
      const rows: VariantInput[] = [];

      if (sizes.length > 0 || colors.length > 0) {
        const sizeList = sizes.length > 0 ? sizes : [DEFAULT_VARIANT_SIZE];
        const colorList = colors.length > 0 ? colors : [{ name: DEFAULT_VARIANT_COLOR, hex: null }];
        for (const size of sizeList) {
          for (const color of colorList) {
            rows.push({ size, color: color.name, hex: color.hex ?? null, stock: defaultStock });
          }
        }
      } else {
        rows.push({
          size: DEFAULT_VARIANT_SIZE,
          color: DEFAULT_VARIANT_COLOR,
          hex: null,
          stock: defaultStock,
        });
      }

      await this.sync(product.id, rows);
      productsTouched += 1;
      created += rows.length;
    }

    return { productsTouched, variantsCreated: created };
  },
};
