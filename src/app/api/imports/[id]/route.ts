import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const info = db.prepare("DELETE FROM imports WHERE id = ?").run(Number(id));
  if (info.changes === 0) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json({ ok: true });
}