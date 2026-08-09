import { NextRequest, NextResponse } from 'next/server';
import { sql, Note } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month');
  const date = req.nextUrl.searchParams.get('date');
  const year = req.nextUrl.searchParams.get('year');
  let rows: Note[];
  if (date) {
    rows = await sql`SELECT * FROM notes WHERE date = ${date} ORDER BY COALESCE(time,'99:99'), id` as Note[];
  } else if (month) {
    rows = await sql`SELECT * FROM notes WHERE date LIKE ${month + '%'} ORDER BY date, COALESCE(time,'99:99'), id` as Note[];
  } else if (year) {
    rows = await sql`SELECT * FROM notes WHERE date LIKE ${year + '%'} ORDER BY date, COALESCE(time,'99:99'), id` as Note[];
  } else {
    rows = await sql`SELECT * FROM notes ORDER BY date DESC, COALESCE(time,'99:99'), id DESC LIMIT 500` as Note[];
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.date || !body.content?.trim()) {
    return NextResponse.json({ error: 'date và content là bắt buộc' }, { status: 400 });
  }
  const rows = await sql`INSERT INTO notes (date, time, content) VALUES (${body.date}, ${body.time || null}, ${body.content.trim()}) RETURNING *` as Note[];
  return NextResponse.json(rows[0], { status: 201 });
}
