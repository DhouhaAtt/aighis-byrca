import { NextResponse } from "next/server";
import { categoryRepository } from "../../lib/repositories/category.repository";
import { isAdmin, unauthorized } from "../../lib/requireAdmin";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
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
  if (!(await isAdmin())) return unauthorized();
  try {
    const body = await request.json();
    const category = await categoryRepository.create({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      image: body.image || null,
      isActive: body.isActive ?? true,
      order: body.order ?? 0,
    });
    const full = await categoryRepository.findById(category.id);
    return NextResponse.json(full, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
