import { prisma } from "../prisma";

export interface CreateProductInput {
  name: string;
  price: string;
  originalPrice?: string | null;
  image: string;
  hoverImage?: string | null;
  gender?: string | null;
  isOnSale?: boolean;
  isNewArrival?: boolean;
  stock?: number;
  tags?: string | null;
  collection?: string | null;
  description?: string | null;
  composition?: string | null;
  fit?: string | null;
  productCode?: string | null;
  careInstructions?: string | null;
  images?: string | null;
  colors?: string | null;
  sizes?: string | null;
  shipping?: string | null;
  returns?: string | null;
  categoryId?: number | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export const productRepository = {
  async findAll() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: { id: "asc" },
    });
  },

  async findById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: { orderBy: { id: "asc" } } },
    });
  },

  async findByCategory(slug: string) {
    return prisma.product.findMany({
      where: { category: { slug } },
      include: { category: true },
      orderBy: { id: "asc" },
    });
  },

  async create(data: CreateProductInput) {
    return prisma.product.create({ data });
  },

  async update(id: number, data: UpdateProductInput) {
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.product.delete({ where: { id } });
  },
};
