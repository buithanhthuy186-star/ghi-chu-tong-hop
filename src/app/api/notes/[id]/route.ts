import { NextRequest, NextResponse } from 'next/server';
import { sql, Note } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'body không hợp lệ' }, { status: 400 });
  const existing = await sql`SELECT * FROM notes WHERE id = ${Number(id)}` as Note[];
  if (existing.length === 0) return NextResponse.json({ error: 'không tìm thấy note' }, { status: 404 });
  const cur = existing[0];
  const rows = await sql`UPDATE notes SET date = ${body.date ?? cur.date}, time = ${body.time !== undefined ? body.time || null : cur.time}, content = ${body.content?.trim() || cur.content} WHERE id = ${Number(id)} RETURNING *` as Note[];
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await sql`DELETE FROM notes WHERE id = ${Number(id)} RETURNING id` as { id: number }[];
  if (result.length === 0) return NextResponse.json({ error: 'không tìm thấy note' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
