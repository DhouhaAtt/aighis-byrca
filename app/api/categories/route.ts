import { NextResponse } from "next/server";
import { categoryRepository } from "../../lib/repositories/category.repository";

export async function GET() {
  try {
    const categories = await categoryRepository.findAll();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = await categoryRepository.create({
      name: body.name,
      slug: body.slug,
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
