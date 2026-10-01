import { NextRequest, NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { isAdmin, unauthorized } from "../../../../lib/requireAdmin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: [{ size: "asc" }, { color: "asc" }],
  });

  return NextResponse.json(variants);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const body = await request.json();
  const updates = Array.isArray(body) ? body : body.updates;
  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Updates array is required" }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      updates.map((u) => {
        const data = {
          stock: Math.max(0, Math.trunc(Number(u.stock) || 0)),
          hex: u.hex ?? null,
        };
        return prisma.productVariant.update({
          where: { id: Number(u.id) },
          data,
        });
      })
    );

    const aggregate = await prisma.productVariant.aggregate({
      where: { productId },
      _sum: { stock: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: { stock: aggregate._sum.stock ?? 0 },
    });

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: [{ size: "asc" }, { color: "asc" }],
    });

    return NextResponse.json(variants);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update variant stock" },
      { status: 400 }
    );
  }
}
