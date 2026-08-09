"use client";

import { useEffect, useState, useCallback } from "react";
import { api, fmtMoney, type Note, type Price } from "@/lib/ui";
type ImportRow = { id: number; file_name: string; data_json: string; created_at: string };
import { Reveal } from "./anim";
import { MetalToggle } from "./metal-toggle";
import { LiquidMetalButton } from "./liquid-metal-button";

type ExcelMatch = { file_name: string; sheet: string; preview: string };
type SearchRes = { q: string; mode: string; notes: Note[]; prices: Price[]; imports: ExcelMatch[] };
type Mode = "words" | "phrase";

export default function SearchTab() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode>("words");
  const [res, setRes] = useState<SearchRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [upMsg, setUpMsg] = useState("");

  const loadImports = useCallback(() => {
    api<ImportRow[]>("/api/imports").then(setImports).catch(() => {});
  }, []);
  useEffect(() => { loadImports(); }, [loadImports]);

  useEffect(() => {
    if (!q.trim()) { setRes(null); return; }
    setLoading(true);
    const t = setTimeout(() => {
      api<SearchRes>(`/api/search?q=${encodeURIComponent(q)}&mode=${mode}`)
        .then((r) => { setRes(r); setSearchId((s) => s + 1); })
        .catch(() => setRes(null))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, mode]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUpMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/imports", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUpMsg(`✅ Đã import "${data.file_name}" (${data.sheets} sheet, ${data.rows} dòng)`);
      loadImports();
      // Reset input
      e.target.value = "";
    } catch (err) {
      setUpMsg(`❌ ${(err as Error).message}`);
    }
    setUploading(false);
  };

  const deleteImport = async (id: number) => {
    await fetch(`/api/imports/${id}`, { method: "DELETE" });
    loadImports();
  };

  const total = res ? res.notes.length + res.prices.length + res.imports.length : 0;

  return (
    <div className="space-y-5">
      {/* Upload Excel */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">📎 Tải lên Excel</h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <LiquidMetalButton
              label={uploading ? "Đang tải..." : "Chọn file Excel"}
              width={170}
              onClick={() => {}}
            />
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {upMsg && <span className="text-sm text-zinc-400">{upMsg}</span>}
        </div>
        {imports.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-zinc-500">File đã tải lên:</p>
            {imports.map((imp) => (
              <div key={imp.id} className="flex items-center gap-2 text-sm text-zinc-400">
                <span>📄 {imp.file_name}</span>
                <button onClick={() => deleteImport(imp.id)} className="text-xs text-zinc-500 hover:text-red-400">Xoá</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={mode === "words" ? "Tìm tách từ: 'chống thấm betong' → dữ liệu chứa cả 3 từ..." : "Tìm cả cụm: 'giá sơn' → phải khớp đúng cụm 'giá sơn'..."}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base"
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-zinc-500">Chế độ tìm:</span>
        <MetalToggle<Mode>
          options={[
            { key: "words", label: "🔤 Tách từ" },
            { key: "phrase", label: "📌 Cả cụm" },
          ]}
          value={mode}
          onChange={setMode}
          optionWidth={110}
        />
      </div>

      {loading && <p className="text-sm text-zinc-500">Đang tìm...</p>}

      {res && !loading && (
        <>
          <p className="text-sm text-zinc-400">
            Kết quả cho "{res.q}" — {total} mục ({res.imports.length} từ Excel, {res.prices.length} giá, {res.notes.length} lịch)
          </p>

          {res.imports.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-300">📎 Dữ liệu Excel</h2>
              <Reveal stagger replayKey={searchId} className="space-y-2">
                {res.imports.map((m, i) => (
                  <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-zinc-500">📄 {m.file_name}</span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-amber-300">{m.sheet}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-200">{m.preview}</p>
                  </div>
                ))}
              </Reveal>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-300">💰 Bảng giá</h2>
            {res.prices.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-sm text-zinc-500">Không có dữ liệu.</p>
            ) : (
              <Reveal stagger replayKey={searchId} className="space-y-2">
                {res.prices.map((p) => (
                  <div key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{p.name}</span>
                      <span className="tabular-nums font-semibold text-zinc-100">{fmtMoney(p.price)} {p.unit || ""}</span>
                    </div>
                    {(p.note || p.date) && <p className="mt-1 text-sm text-zinc-400">{[p.date, p.note].filter(Boolean).join(" · ")}</p>}
                  </div>
                ))}
              </Reveal>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-300">📅 Lịch</h2>
            {res.notes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-sm text-zinc-500">Không có dữ liệu.</p>
            ) : (
              <Reveal stagger replayKey={searchId} className="space-y-2">
                {res.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <p className="whitespace-pre-wrap">{n.content}</p>
                    <p className="mt-1 text-xs text-zinc-500">{n.date.split("-").reverse().join("/")} {n.time ? `· ${n.time}` : ""}</p>
                  </div>
                ))}
              </Reveal>
            )}
          </section>
        </>
      )}
    </div>
  );
}