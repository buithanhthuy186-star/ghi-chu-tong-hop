import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body không hợp lệ" }, { status: 400 });
  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(Number(id));
  if (!existing) return NextResponse.json({ error: "không tìm thấy note" }, { status: 404 });
  db.prepare("UPDATE notes SET date = ?, time = ?, content = ? WHERE id = ?").run(
    body.date ?? (existing as { date: string }).date,
    body.time !== undefined ? body.time || null : (existing as { time: string | null }).time,
    body.content?.trim() || (existing as { content: string }).content,
    Number(id)
  );
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(Number(id));
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const info = db.prepare("DELETE FROM notes WHERE id = ?").run(Number(id));
  if (info.changes === 0) return NextResponse.json({ error: "không tìm thấy note" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
