import { prisma } from "../prisma";
import { parseAmount } from "../pricing";
import { DEFAULT_VARIANT_COLOR } from "../productJson";
import {
  ACTIVE_STATUSES,
  DEFAULT_ORDER_STATUS,
  isOrderStatus,
  type OrderStatus,
} from "../orderStatus";

export interface CreateOrderItemInput {
  productId?: number;
  variantId?: number | null;
  productName: string;
  productPrice: string;
  size: string;
  color?: string | null;
  hex?: string | null;
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

export class OutOfStockError extends Error {
  constructor(public productName: string) {
    super(`Not enough stock for ${productName}`);
    this.name = "OutOfStockError";
  }
}

function parsePrice(price: string): number {
  return parseAmount(price) ?? 0;
}

type VariantRow = { id: number; size: string; color: string; hex: string | null; stock: number };

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Resolves the variant a cart line refers to. Clients may omit the colour for
 * products that were created without colour options, so an empty colour falls
 * back to the default variant instead of falling through to Product.stock.
 */
function resolveVariant(
  variants: VariantRow[],
  requested: { size: string; color: string | null }
): VariantRow | null {
  if (variants.length === 0) return null;

  const wantedColor = normalize(requested.color);
  const sameSize = variants.filter((v) => normalize(v.size) === normalize(requested.size));

  if (sameSize.length === 0) return null;

  if (wantedColor) {
    return (
      sameSize.find((v) => normalize(v.color) === wantedColor) ??
      sameSize.find((v) => normalize(v.color) === normalize(DEFAULT_VARIANT_COLOR)) ??
      null
    );
  }

  return (
    sameSize.find((v) => normalize(v.color) === normalize(DEFAULT_VARIANT_COLOR)) ??
    sameSize.find((v) => normalize(v.color) === "") ??
    null
  );
}

/** Restores variant stock for every item of an order. */
async function restockOrderItems(orderId: number): Promise<void> {
  const items = await prisma.orderItem.findMany({
    where: { orderId, variantId: { not: null } },
  });

  for (const item of items) {
    if (item.variantId === null) continue;
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
  }

  const productIds = [
    ...new Set(items.map((item) => item.productId).filter((id): id is number => id !== null)),
  ];

  for (const productId of productIds) {
    const aggregate = await prisma.productVariant.aggregate({
      where: { productId },
      _sum: { stock: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: { stock: aggregate._sum.stock ?? 0 },
    });
  }
}

export const orderRepository = {
  async findAll() {
    return prisma.order.findMany({
      include: { items: true, events: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true, variant: true } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  async create(data: CreateOrderInput) {
    const { items, ...orderData } = data;
    return prisma.order.create({
      data: {
        ...orderData,
        status: DEFAULT_ORDER_STATUS,
        items: items?.length ? { create: items } : undefined,
        events: { create: { status: DEFAULT_ORDER_STATUS, note: "Order placed" } },
      },
      include: { items: true, events: true },
    });
  },

  /**
   * Creates an order and reserves stock in one transaction. Prices are always
   * read from the database, never from the request payload.
   */
  async createWithStockReservation(
    data: Omit<CreateOrderInput, "totalAmount" | "items"> & {
      items: {
        productId: number;
        size: string;
        color: string | null;
        quantity: number;
      }[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const items: CreateOrderItemInput[] = [];
      let total = 0;

      for (const requested of data.items) {
        const product = await tx.product.findUnique({
          where: { id: requested.productId },
          include: { variants: true },
        });
        if (!product) throw new Error(`Product ${requested.productId} no longer exists`);

        const variant = resolveVariant(product.variants, requested);
        const resolvedColor = variant ? variant.color : requested.color;

        if (variant) {
          if (variant.stock < requested.quantity) {
            throw new OutOfStockError(`${product.name} (${variant.size}${variant.color ? ` / ${variant.color}` : ""})`);
          }
        } else if (product.stock < requested.quantity) {
          throw new OutOfStockError(product.name);
        }

        const unitPrice = parsePrice(product.price);
        total += unitPrice * requested.quantity;

        items.push({
          productId: product.id,
          variantId: variant?.id ?? null,
          productName: product.name,
          productPrice: product.price,
          size: variant?.size ?? requested.size,
          color: resolvedColor || null,
          hex: variant?.hex ?? null,
          quantity: requested.quantity,
        });

        if (variant) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: requested.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: requested.quantity } },
          });
        }
      }

      const order = await tx.order.create({
        data: {
          orderRef: data.orderRef,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          paymentMethod: data.paymentMethod,
          totalAmount: `${total.toFixed(2)} Tnd`,
          notes: data.notes ?? null,
          status: DEFAULT_ORDER_STATUS,
          items: { create: items },
          events: { create: { status: DEFAULT_ORDER_STATUS, note: "Order placed" } },
        },
        include: { items: true, events: true },
      });

      const touchedProducts = [...new Set(items.map((i) => i.productId))];
      for (const productId of touchedProducts) {
        const aggregate = await tx.productVariant.aggregate({
          where: { productId },
          _sum: { stock: true },
        });
        if (aggregate._sum.stock !== null) {
          await tx.product.update({
            where: { id: productId },
            data: { stock: aggregate._sum.stock },
          });
        }
      }

      return order;
    });
  },

  async updateStatus(id: number, status: OrderStatus, note?: string) {
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new Error("Order not found");

    const wasActive = ACTIVE_STATUSES.includes(existing.status as OrderStatus);
    const becomesInactive = status === "Cancelled";

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
        include: { items: true },
      });

      await tx.orderStatusEvent.create({
        data: { orderId: id, status, note: note ?? null },
      });

      if (wasActive && becomesInactive) {
        for (const item of existing.items) {
          if (item.variantId === null) continue;
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        const productIds = [
          ...new Set(
            existing.items
              .map((i) => i.productId)
              .filter((pid): pid is number => pid !== null)
          ),
        ];
        for (const productId of productIds) {
          const aggregate = await tx.productVariant.aggregate({
            where: { productId },
            _sum: { stock: true },
          });
          await tx.product.update({
            where: { id: productId },
            data: { stock: aggregate._sum.stock ?? 0 },
          });
        }
      }

      return order;
    });
  },

  async delete(id: number) {
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new Error("Order not found");

    const wasActive = ACTIVE_STATUSES.includes(existing.status as OrderStatus);

    if (wasActive) {
      await restockOrderItems(id);
    }

    await prisma.order.delete({ where: { id } });
    return { deleted: true, restocked: wasActive };
  },

  async findRecent(limit: number) {
    return prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /**
   * Public order lookup used by the order tracking page. The reference alone is
   * not enough: callers must also supply the email or phone used at checkout so
   * a guessed reference cannot expose somebody else's order.
   */
  async findForTracking(orderRef: string, contact: string) {
    const ref = orderRef.trim();
    const needle = contact.trim().toLowerCase();
    if (!ref || !needle) return null;

    const order = await prisma.order.findUnique({
      where: { orderRef: ref.toUpperCase() },
      include: { items: true, events: { orderBy: { createdAt: "asc" } } },
    });
    if (!order) return null;

    const matches =
      order.customerEmail.toLowerCase() === needle ||
      order.customerPhone.replace(/[\s.-]/g, "").toLowerCase() ===
        needle.replace(/[\s.-]/g, "");

    return matches ? order : null;
  },

  async getStats(): Promise<DashboardStats> {
    const [totalProducts, totalCategories, orders] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({ select: { totalAmount: true, status: true } }),
    ]);

    const revenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + parsePrice(o.totalAmount), 0);

    return {
      totalProducts,
      totalCategories,
      totalOrders: orders.length,
      revenue,
    };
  },
};

export { isOrderStatus };
