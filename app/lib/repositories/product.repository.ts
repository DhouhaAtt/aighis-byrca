import { prisma } from "../prisma";

export interface CreateProductInput {
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  hoverImage?: string;
  gender?: string;
  isOnSale?: boolean;
  stock?: number;
  tags?: string;
  collection?: string;
  description?: string;
  composition?: string;
  fit?: string;
  productCode?: string;
  careInstructions?: string;
  images?: string;
  colors?: string;
  sizes?: string;
  shipping?: string;
  returns?: string;
  categoryId?: number;
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
      include: { category: true },
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
