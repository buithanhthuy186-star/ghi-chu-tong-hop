import { NextRequest, NextResponse } from "next/server";
import { getDb, Note, Price, Import } from "@/lib/db";
import { searchMatch } from "@/lib/search";

export const dynamic = "force-dynamic";

type ExcelMatch = {
  file_name: string;
  sheet: string;
  preview: string; // dòng text khớp
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const mode = req.nextUrl.searchParams.get("mode") === "phrase" ? "phrase" : "words";
  if (!q) return NextResponse.json({ q, mode, notes: [], prices: [], imports: [] });
  const db = getDb();

  const notes = db.prepare("SELECT * FROM notes ORDER BY date DESC, id DESC LIMIT 2000").all() as Note[];
  const prices = db.prepare("SELECT * FROM prices ORDER BY id DESC LIMIT 2000").all() as Price[];
  const imports = db.prepare("SELECT * FROM imports ORDER BY id DESC LIMIT 200").all() as Import[];

  const matchedNotes = notes.filter((n) => searchMatch(q, `${n.content} ${n.date} ${n.time || ""}`, mode));
  const matchedPrices = prices.filter((p) => searchMatch(q, `${p.name} ${p.unit || ""} ${p.note || ""}`, mode));

  // Search trong Excel: duyệt từng sheet, từng dòng, trả về dòng cụ thể match
  const matchedImports: ExcelMatch[] = [];
  for (const imp of imports) {
    const data = JSON.parse(imp.data_json) as Record<string, unknown[][]>;
    for (const [sheetName, rows] of Object.entries(data)) {
      for (const row of rows) {
        const rowText = row.filter((c) => c !== "" && c !== null).join(" ");
        if (searchMatch(q, rowText, mode)) {
          matchedImports.push({
            file_name: imp.file_name,
            sheet: sheetName,
            preview: row.filter((c) => c !== "" && c !== null).join(" | "),
          });
        }
      }
    }
  }

  return NextResponse.json({ q, mode, notes: matchedNotes, prices: matchedPrices, imports: matchedImports });
}