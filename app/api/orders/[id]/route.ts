import { NextRequest, NextResponse } from "next/server";

import { orderRepository } from "../../../lib/repositories/order.repository";
import { isAdmin, unauthorized } from "../../../lib/requireAdmin";
import { canTransition, isOrderStatus, NOTIFY_STATUSES, STATUS_LABELS, type OrderStatus } from "../../../lib/orderStatus";
import { sendOrderStatusEmail } from "../../../lib/email";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const { id } = await params;
    const order = await orderRepository.findById(Number(id));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  const orderId = Number(id);

  let body: { status?: unknown; note?: unknown; notify?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isOrderStatus(body.status)) {
    return NextResponse.json({ error: "Unknown status" }, { status: 400 });
  }

  const status = body.status;
  const note = typeof body.note === "string" ? body.note.trim() : undefined;
  const wantsEmail = body.notify !== false;

  const existing = await orderRepository.findById(orderId);
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const currentStatus = existing.status as OrderStatus;

  if (!canTransition(currentStatus, status)) {
    return NextResponse.json(
      {
        error: `Cannot change status from ${STATUS_LABELS[currentStatus] ?? currentStatus} to ${STATUS_LABELS[status] ?? status}`,
      },
      { status: 409 }
    );
  }

  if (currentStatus === status) {
    return NextResponse.json({ order: existing, email: null, unchanged: true });
  }

  try {
    await orderRepository.updateStatus(orderId, status, note);
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  let email: { sent: boolean; reason?: string } | null = null;

  if (wantsEmail && NOTIFY_STATUSES.includes(status)) {
    const order = await orderRepository.findById(orderId);
    if (order) {
      email = await sendOrderStatusEmail(
        {
          orderRef: order.orderRef,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          items: order.items.map((item) => ({
            productName: item.productName,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
        },
        status
      );
    }
  }

  const updated = await orderRepository.findById(orderId);
  return NextResponse.json({ order: updated, email });
}

/** Resends the customer notification for the order's current status. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  const orderId = Number(id);

  const order = await orderRepository.findById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let body: { status?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const target = isOrderStatus(body.status) ? body.status : (order.status as never);
  if (!isOrderStatus(target)) {
    return NextResponse.json({ error: "Unknown status" }, { status: 400 });
  }

  const result = await sendOrderStatusEmail(
    {
      orderRef: order.orderRef,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => ({
        productName: item.productName,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
    },
    target
  );

  if (!result.sent) {
    return NextResponse.json(
      { error: result.reason ?? "Email could not be sent", email: result },
      { status: 502 }
    );
  }

  return NextResponse.json({ email: result });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  try {
    const result = await orderRepository.delete(Number(id));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
