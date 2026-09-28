import { NextResponse } from "next/server";
import { orderRepository } from "../../lib/repositories/order.repository";

export async function GET() {
  try {
    const [stats, recentOrders] = await Promise.all([
      orderRepository.getStats(),
      orderRepository.findRecent(5),
    ]);

    return NextResponse.json({
      totalProducts: stats.totalProducts,
      totalCategories: stats.totalCategories,
      totalOrders: stats.totalOrders,
      revenue: stats.revenue,
      recentOrders: recentOrders.map((o) => ({
        orderRef: o.orderRef,
        customer: o.customerName,
        items: o.items.length,
        total: o.totalAmount,
        status: o.status,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
