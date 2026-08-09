import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await sql`DELETE FROM imports WHERE id = ${Number(id)} RETURNING id` as { id: number }[];
  if (result.length === 0) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
