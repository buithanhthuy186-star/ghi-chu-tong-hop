import { NextRequest, NextResponse } from "next/server";
import { getDb, Note } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const db = getDb();
  const month = req.nextUrl.searchParams.get("month"); // YYYY-MM
  const date = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD
  const year = req.nextUrl.searchParams.get("year"); // YYYY
  let rows: Note[];
  if (date) {
    rows = db
      .prepare("SELECT * FROM notes WHERE date = ? ORDER BY COALESCE(time,'99:99'), id")
      .all(date) as Note[];
  } else if (month) {
    rows = db
      .prepare("SELECT * FROM notes WHERE date LIKE ? ORDER BY date, COALESCE(time,'99:99'), id")
      .all(month + "%") as Note[];
  } else if (year) {
    rows = db
      .prepare("SELECT * FROM notes WHERE date LIKE ? ORDER BY date, COALESCE(time,'99:99'), id")
      .all(year + "%") as Note[];
  } else {
    rows = db
      .prepare("SELECT * FROM notes ORDER BY date DESC, COALESCE(time,'99:99'), id DESC LIMIT 500")
      .all() as Note[];
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json().catch(() => null);
  if (!body || !body.date || !body.content?.trim()) {
    return NextResponse.json({ error: "date và content là bắt buộc" }, { status: 400 });
  }
  const info = db
    .prepare("INSERT INTO notes (date, time, content) VALUES (?, ?, ?)")
    .run(body.date, body.time || null, body.content.trim());
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
