import { NextRequest, NextResponse } from "next/server";
import { categoryRepository } from "../../../lib/repositories/category.repository";
import { isAdmin, unauthorized } from "../../../lib/requireAdmin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const { id } = await params;
    const category = await categoryRepository.findById(Number(id));
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await categoryRepository.update(Number(id), {
      name: body.name,
      slug: body.slug,
      description: body.description ?? undefined,
      image: body.image ?? undefined,
      isActive: body.isActive ?? undefined,
      order: body.order ?? undefined,
    });
    const category = await categoryRepository.findById(updated.id);
    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const { id } = await params;
    const category = await categoryRepository.findById(Number(id));
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    await categoryRepository.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
