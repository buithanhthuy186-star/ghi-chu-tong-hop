import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body không hợp lệ" }, { status: 400 });
  const existing = db.prepare("SELECT * FROM prices WHERE id = ?").get(Number(id)) as
    | { name: string; price: number | null; unit: string | null; note: string | null; date: string | null }
    | undefined;
  if (!existing) return NextResponse.json({ error: "không tìm thấy dòng giá" }, { status: 404 });
  db.prepare("UPDATE prices SET name = ?, price = ?, unit = ?, note = ?, date = ? WHERE id = ?").run(
    body.name?.trim() || existing.name,
    body.price !== undefined ? (body.price === "" || body.price === null ? null : Number(body.price)) : existing.price,
    body.unit !== undefined ? body.unit?.trim() || null : existing.unit,
    body.note !== undefined ? body.note?.trim() || null : existing.note,
    body.date !== undefined ? body.date || null : existing.date,
    Number(id)
  );
  const row = db.prepare("SELECT * FROM prices WHERE id = ?").get(Number(id));
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const info = db.prepare("DELETE FROM prices WHERE id = ?").run(Number(id));
  if (info.changes === 0) return NextResponse.json({ error: "không tìm thấy dòng giá" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
