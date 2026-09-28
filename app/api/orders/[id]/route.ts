import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "../../../lib/repositories/order.repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await orderRepository.findById(Number(id));
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }
    const existing = await orderRepository.findById(Number(id));
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    await orderRepository.updateStatus(Number(id), body.status);
    const updated = await orderRepository.findById(Number(id));
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
