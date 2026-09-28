import { NextRequest, NextResponse } from "next/server";
import { productRepository } from "../../../lib/repositories/product.repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productRepository.findById(Number(id));
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch product" },
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
    const existing = await productRepository.findById(Number(id));
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const updated = await productRepository.update(Number(id), {
      name: body.name ?? existing.name,
      price: body.price ?? existing.price,
      originalPrice: body.originalPrice ?? existing.originalPrice,
      image: body.image ?? existing.image,
      hoverImage: body.hoverImage ?? existing.hoverImage,
      gender: body.gender ?? existing.gender,
      isOnSale: body.isOnSale ?? existing.isOnSale,
      stock: body.stock ?? existing.stock,
      tags: body.tags ?? existing.tags,
      collection: body.collection ?? existing.collection,
      description: body.description ?? existing.description,
      composition: body.composition ?? existing.composition,
      fit: body.fit ?? existing.fit,
      productCode: body.productCode ?? existing.productCode,
      careInstructions: body.careInstructions ?? existing.careInstructions,
      images: body.images ?? existing.images,
      colors: body.colors ?? existing.colors,
      sizes: body.sizes ?? existing.sizes,
      shipping: body.shipping ?? existing.shipping,
      returns: body.returns ?? existing.returns,
      categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
    });
    const full = await productRepository.findById(updated.id);
    return NextResponse.json(full);
  } catch {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await productRepository.findById(Number(id));
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await productRepository.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
