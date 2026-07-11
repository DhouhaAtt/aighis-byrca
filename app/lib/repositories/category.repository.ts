import { prisma } from "../prisma";

export interface CreateCategoryInput {
  name: string;
  slug: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
}

export const categoryRepository = {
  async findAll() {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { id: "asc" },
    });
  },

  async findById(id: number) {
    return prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
  },

  async create(data: CreateCategoryInput) {
    return prisma.category.create({ data });
  },

  async update(id: number, data: UpdateCategoryInput) {
    return prisma.category.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.category.delete({ where: { id } });
  },
};
