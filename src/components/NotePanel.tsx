"use client";

import { useState } from "react";
import { api, type Note } from "@/lib/ui";
import { LiquidMetalButton } from "./liquid-metal-button";

interface NotePanelProps {
  date: string;
  notes: Note[];
  onChanged: () => void;
  showTitle?: boolean;
}

/** Danh sách ghi chú của 1 ngày + form thêm/sửa (dùng chung cho xem tháng và xem ngày). */
export function NotePanel({ date, notes, onChanged, showTitle = true }: NotePanelProps) {
  const [time, setTime] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [err, setErr] = useState("");

  const resetForm = () => { setEditId(null); setContent(""); setTime(""); };

  const submit = async () => {
    setErr("");
    if (!content.trim()) { setErr("Nội dung không được trống"); return; }
    try {
      if (editId) {
        await api(`/api/notes/${editId}`, "PATCH", { date, time: time || null, content });
      } else {
        await api("/api/notes", "POST", { date, time: time || null, content });
      }
      resetForm();
      onChanged();
    } catch (e) {
      setErr(String((e as Error).message || e));
    }
  };

  const edit = (n: Note) => { setEditId(n.id); setTime(n.time || ""); setContent(n.content); };

  const del = async (id: number) => {
    await api(`/api/notes/${id}`, "DELETE");
    if (editId === id) resetForm();
    onChanged();
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      {showTitle && (
        <h2 className="mb-3 font-semibold text-zinc-200">
          Ghi chú ngày {date.split("-").reverse().join("/")}
        </h2>
      )}
      <div className="mb-4 space-y-2">
        {notes.length === 0 && <p className="text-sm text-zinc-500">Chưa có ghi chú.</p>}
        {notes.map((n) => (
          <div key={n.id} className="flex items-start gap-2 rounded-xl border border-zinc-800/70 bg-zinc-900 p-2.5">
            <span className="mt-0.5 shrink-0 rounded-md bg-gradient-to-b from-zinc-600 to-zinc-800 px-1.5 py-0.5 text-xs font-semibold text-zinc-100">
              {n.time || "—"}
            </span>
            <span className="flex-1 whitespace-pre-wrap text-sm text-zinc-200">{n.content}</span>
            <button onClick={() => edit(n)} className="text-xs text-zinc-400 hover:text-white">Sửa</button>
            <button onClick={() => del(n.id)} className="text-xs text-zinc-400 hover:text-red-400">Xoá</button>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung ghi chú..."
          rows={3}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <div className="flex items-center gap-3">
          <LiquidMetalButton
            label={editId ? "Lưu thay đổi" : "Thêm ghi chú"}
            width={170}
            onClick={submit}
          />
          {editId && (
            <button onClick={resetForm} className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
              Huỷ
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
