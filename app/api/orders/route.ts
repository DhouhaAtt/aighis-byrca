import { NextResponse } from "next/server";

import { orderRepository, OutOfStockError } from "../../lib/repositories/order.repository";
import { isAdmin, unauthorized } from "../../lib/requireAdmin";

export function generateOrderRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
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

/**
 * Public endpoint used by checkout. Prices are recomputed from the database and
 * stock is reserved in the same transaction, so a tampered payload cannot
 * change what the customer is charged or oversell a variant.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

  const customerName = text(body.customerName);
  const customerEmail = text(body.customerEmail).toLowerCase();
  const customerPhone = text(body.customerPhone);
  const address = text(body.address);
  const city = text(body.city);
  const paymentMethod = text(body.paymentMethod);
  const rawItems = Array.isArray(body.items) ? body.items : [];

  const missing: string[] = [];
  if (!customerName) missing.push("full name");
  if (!customerEmail) missing.push("email address");
  if (!customerPhone) missing.push("phone number");
  if (!address) missing.push("address");
  if (!city) missing.push("city");
  if (!paymentMethod) missing.push("payment method");
  if (rawItems.length === 0) missing.push("items");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (!EMAIL_PATTERN.test(customerEmail)) {
    return NextResponse.json(
      { error: "Please provide a valid email address" },
      { status: 400 }
    );
  }

  const items = rawItems
    .map((entry) => {
      const record = (entry ?? {}) as Record<string, unknown>;
      const productId = Number(record.productId);
      const quantity = Math.trunc(Number(record.quantity));
      return {
        productId: Number.isFinite(productId) ? productId : null,
        size: text(record.size) || "One Size",
        color: text(record.color) || null,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
      };
    })
    .filter((item) => item.productId !== null && item.quantity > 0);

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Your cart is empty" },
      { status: 400 }
    );
  }

  try {
    const order = await orderRepository.createWithStockReservation({
      orderRef: text(body.orderRef) || generateOrderRef(),
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      postalCode: text(body.postalCode),
      paymentMethod,
      notes: text(body.notes) || undefined,
      items: items as {
        productId: number;
        size: string;
        color: string | null;
        quantity: number;
      }[],
    });

    return NextResponse.json(
      {
        orderRef: order.orderRef,
        totalAmount: order.totalAmount,
        status: order.status,
        itemCount: order.items.length,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof OutOfStockError) {
      return NextResponse.json(
        {
          error: `Some items just sold out. Please review your cart: ${error.message}`,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
