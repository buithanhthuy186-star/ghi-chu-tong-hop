import { NextRequest, NextResponse } from "next/server";
import { getDb, Import } from "@/lib/db";
import { read, utils } from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM imports ORDER BY id DESC LIMIT 100").all() as Import[];
  return NextResponse.json(rows.map((r) => ({ ...r, data_json: JSON.parse(r.data_json) })));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json({ error: "Chỉ hỗ trợ file .xlsx / .xls" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const wb = read(buf, { type: "buffer" });
    const allData: Record<string, unknown[][]> = {};

    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      const rows = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" });
      // Filter empty rows
      const filtered = rows.filter((row) => row.some((cell) => cell !== "" && cell !== null));
      if (filtered.length > 0) allData[sheetName] = filtered;
    }

    if (Object.keys(allData).length === 0) {
      return NextResponse.json({ error: "File Excel không có dữ liệu" }, { status: 400 });
    }

    const db = getDb();
    const info = db
      .prepare("INSERT INTO imports (file_name, data_json) VALUES (?, ?)")
      .run(file.name, JSON.stringify(allData));

    return NextResponse.json({ id: info.lastInsertRowid, file_name: file.name, sheets: Object.keys(allData).length, rows: Object.values(allData).reduce((s, r) => s + r.length, 0) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: `Lỗi xử lý file: ${(e as Error).message}` }, { status: 500 });
  }
}