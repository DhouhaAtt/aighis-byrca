import { NextResponse } from "next/server";
import { orderRepository } from "../../lib/repositories/order.repository";
import { productRepository } from "../../lib/repositories/product.repository";
import { categoryRepository } from "../../lib/repositories/category.repository";

export async function GET() {
  try {
    const stats = await orderRepository.getStats();
    const products = await productRepository.findAll();
    const categories = await categoryRepository.findAll();
    const recentOrders = await orderRepository.findAll();

    return NextResponse.json({
      totalProducts: stats.totalProducts,
      totalCategories: stats.totalCategories,
      totalOrders: stats.totalOrders,
      revenue: stats.revenue,
      productCount: products.length,
      categoryCount: categories.length,
      recentOrders: recentOrders.slice(0, 5).map((o) => ({
        id: `#${o.id}`,
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
