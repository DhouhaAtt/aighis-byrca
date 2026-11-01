import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { isAdmin, unauthorized } from "../../../lib/requireAdmin";

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? [...new Set(body.ids.map(Number).filter((id: number) => Number.isInteger(id) && id > 0))] : [];
    if (ids.length === 0) return NextResponse.json({ error: "Select at least one category." }, { status: 400 });
    const deletedCount = await prisma.$transaction(async (tx) => {
      const count = await tx.category.count({ where: { id: { in: ids } } });
      if (count !== ids.length) throw new Error("Some categories no longer exist. Refresh the list and try again.");
      const result = await tx.category.deleteMany({ where: { id: { in: ids } } });
      return result.count;
    });
    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete categories." }, { status: 500 });
  }
}
