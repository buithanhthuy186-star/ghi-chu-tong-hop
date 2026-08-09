import { NextRequest, NextResponse } from "next/server";
import { getDb, Price } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM prices ORDER BY id DESC LIMIT 1000").all() as Price[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json().catch(() => null);
  if (!body || !body.name?.trim()) {
    return NextResponse.json({ error: "name là bắt buộc" }, { status: 400 });
  }
  const info = db
    .prepare("INSERT INTO prices (name, price, unit, note, date) VALUES (?, ?, ?, ?, ?)")
    .run(
      body.name.trim(),
      body.price !== undefined && body.price !== null && body.price !== "" ? Number(body.price) : null,
      body.unit?.trim() || null,
      body.note?.trim() || null,
      body.date || null
    );
  const row = db.prepare("SELECT * FROM prices WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
