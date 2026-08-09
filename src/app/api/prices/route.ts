import { NextRequest, NextResponse } from 'next/server';
import { sql, Price } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await sql`SELECT * FROM prices ORDER BY id DESC LIMIT 1000` as Price[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name?.trim()) {
    return NextResponse.json({ error: 'name là bắt buộc' }, { status: 400 });
  }
  const rows = await sql`INSERT INTO prices (name, price, unit, note, date) VALUES (${body.name.trim()}, ${body.price !== undefined && body.price !== null && body.price !== '' ? Number(body.price) : null}, ${body.unit?.trim() || null}, ${body.note?.trim() || null}, ${body.date || null}) RETURNING *` as Price[];
  return NextResponse.json(rows[0], { status: 201 });
}
