import { NextRequest, NextResponse } from "next/server";

import { orderRepository } from "../../../lib/repositories/order.repository";
import { connection } from "next/server";

/**
 * Public order tracking lookup. Returns the order status, items and timeline so
 * the customer can follow their order without an account.
 */
export async function POST(request: NextRequest) {
  await connection();

  let body: { orderRef?: unknown; contact?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const orderRef = typeof body.orderRef === "string" ? body.orderRef : "";
  const contact = typeof body.contact === "string" ? body.contact : "";

  if (!orderRef.trim() || !contact.trim()) {
    return NextResponse.json(
      { error: "Order reference and email or phone are required" },
      { status: 400 }
    );
  }

  try {
    const order = await orderRepository.findForTracking(orderRef, contact);

    if (!order) {
      return NextResponse.json(
        { error: "No order found for these details" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderRef: order.orderRef,
      status: order.status,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        productName: item.productName,
        size: item.size,
        color: item.color,
        hex: item.hex,
        quantity: item.quantity,
        productPrice: item.productPrice,
      })),
      events: order.events.map((event) => ({
        status: event.status,
        note: event.note,
        createdAt: event.createdAt,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to look up order" },
      { status: 500 }
    );
  }
}
