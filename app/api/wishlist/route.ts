import { connection, NextRequest, NextResponse } from "next/server";

import { productRepository } from "../../lib/repositories/product.repository";

const MAX_IDS = 200;

/**
 * Public read-only lookup so a customer's wishlist (stored as product ids in
 * localStorage) can be rehydrated with live catalogue data.
 */
export async function GET(request: NextRequest) {
  await connection();

  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  ).slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const products = await productRepository.findManyByIds(ids);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
