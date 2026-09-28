import { prisma } from "../prisma";

export interface CreateOrderItemInput {
  productId?: number;
  productName: string;
  productPrice: string;
  size: string;
  quantity: number;
}

export interface CreateOrderInput {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  totalAmount: string;
  notes?: string;
  items?: CreateOrderItemInput[];
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  revenue: number;
}

function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, ""));
}

export const orderRepository = {
  async findAll() {
    return prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  },

  async create(data: CreateOrderInput) {
    const { items, ...orderData } = data;
    return prisma.order.create({
      data: {
        ...orderData,
        items: items?.length
          ? { create: items }
          : undefined,
      },
      include: { items: true },
    });
  },

  async updateStatus(id: number, status: string) {
    return prisma.order.update({ where: { id }, data: { status } });
  },

  async findRecent(limit: number) {
    return prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getStats(): Promise<DashboardStats> {
    const [totalProducts, totalCategories, orders] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({ select: { totalAmount: true } }),
    ]);
    const revenue = orders.reduce((sum, o) => sum + parsePrice(o.totalAmount), 0);
    return {
      totalProducts,
      totalCategories,
      totalOrders: orders.length,
      revenue,
    };
  },
};
