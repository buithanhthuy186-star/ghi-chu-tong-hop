"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NoteCard } from "./NoteCard";
import type { Note } from "@/lib/db";

const PAGE_SIZE = 20;

interface NotesListProps {
  notes: Note[];
  onUpdate: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => void;
}

export function NotesList({ notes, onUpdate, onDelete, onRefresh }: NotesListProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(notes.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageNotes = notes.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  async function handleUpdate(id: number, content: string) {
    await onUpdate(id, content);
    onRefresh();
  }

  async function handleDelete(id: number) {
    await onDelete(id);
    onRefresh();
  }

  if (notes.length === 0) {
    return (
      <div className="glass-panel py-16 text-center">
        <p className="text-sm text-gray-400">Chưa có ghi chú nào</p>
        <p className="mt-1 text-xs text-gray-300">Thêm ghi chú ở thẻ phía trên để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{notes.length} ghi chú</span>
        {totalPages > 1 && <span>Trang {safePage + 1}/{totalPages}</span>}
      </div>

      <div className="space-y-3">
        {pageNotes.map((note) => (
          <NoteCard key={note.id} note={note} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-600 backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
          >
            <ChevronLeft className="size-4" /> Trước
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`size-8 rounded-lg text-sm font-medium transition-all duration-300 ${
                  i === safePage
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-600 backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
          >
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}