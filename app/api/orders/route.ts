import { NextResponse } from "next/server";
import { orderRepository } from "../../lib/repositories/order.repository";

function generateOrderRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

export async function GET() {
  try {
    const orders = await orderRepository.findAll();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderRef = body.orderRef || generateOrderRef();
    const order = await orderRepository.create({
      orderRef,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      paymentMethod: body.paymentMethod,
      totalAmount: body.totalAmount,
      notes: body.notes || null,
      items: body.items,
    });
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
