import { NextResponse } from "next/server";
import { productRepository } from "../../lib/repositories/product.repository";

export async function GET() {
  try {
    const products = await productRepository.findAll();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await productRepository.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
