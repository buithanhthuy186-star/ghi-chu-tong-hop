import { NextRequest, NextResponse } from 'next/server';
import { sql, Price } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'body không hợp lệ' }, { status: 400 });
  const existing = await sql`SELECT * FROM prices WHERE id = ${Number(id)}` as Price[];
  if (existing.length === 0) return NextResponse.json({ error: 'không tìm thấy dòng giá' }, { status: 404 });
  const cur = existing[0];
  const rows = await sql`UPDATE prices SET name = ${body.name?.trim() || cur.name}, price = ${body.price !== undefined ? (body.price === '' || body.price === null ? null : Number(body.price)) : cur.price}, unit = ${body.unit !== undefined ? body.unit?.trim() || null : cur.unit}, note = ${body.note !== undefined ? body.note?.trim() || null : cur.note}, date = ${body.date !== undefined ? body.date || null : cur.date} WHERE id = ${Number(id)} RETURNING *` as Price[];
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await sql`DELETE FROM prices WHERE id = ${Number(id)} RETURNING id` as { id: number }[];
  if (result.length === 0) return NextResponse.json({ error: 'không tìm thấy dòng giá' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
