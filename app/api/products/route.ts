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
    if (!body.name?.trim() || !body.price?.trim() || !body.image?.trim()) {
      return NextResponse.json(
        { error: "Name, price, and image are required" },
        { status: 400 }
      );
    }
    const product = await productRepository.create({
      name: body.name,
      price: body.price,
      originalPrice: body.originalPrice || null,
      image: body.image,
      hoverImage: body.hoverImage || null,
      gender: body.gender || null,
      isOnSale: body.isOnSale ?? false,
      stock: body.stock ?? 0,
      tags: body.tags || null,
      collection: body.collection || null,
      description: body.description || null,
      composition: body.composition || null,
      fit: body.fit || null,
      productCode: body.productCode || null,
      careInstructions: body.careInstructions || null,
      images: body.images || null,
      colors: body.colors || null,
      sizes: body.sizes || null,
      shipping: body.shipping || null,
      returns: body.returns || null,
      categoryId: body.categoryId || null,
    });
    const full = await productRepository.findById(product.id);
    return NextResponse.json(full, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
