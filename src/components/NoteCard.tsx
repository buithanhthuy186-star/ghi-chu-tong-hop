"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, Clock } from "lucide-react";
import type { Note } from "@/lib/db";

interface NoteCardProps {
  note: Note;
  onUpdate: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function fmtDate(dateStr: string): string {
  return dateStr.split("-").reverse().join("/");
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const t = editText.trim();
    if (!t) return;
    setSaving(true);
    await onUpdate(note.id, t);
    setEditing(false);
    setSaving(false);
  }

  return (
    <div className="glass-panel group relative p-4 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full min-h-[60px] resize-y rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 outline-none backdrop-blur-sm transition-all focus:border-gray-400 focus:ring-2 focus:ring-gray-200/50"
              autoFocus
              rows={2}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
              {note.content}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {fmtDate(note.date)}{note.time ? ` ${note.time}` : ""}
            </span>
          </div>
        </div>

        <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-50" title="Lưu">
                <Check className="size-4" />
              </button>
              <button onClick={() => { setEditText(note.content); setEditing(false); }} className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50" title="Huỷ">
                <X className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditText(note.content); setEditing(true); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:text-gray-700 hover:bg-gray-100" title="Sửa">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => onDelete(note.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:text-red-500 hover:bg-red-50" title="Xoá">
                <Trash2 className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}