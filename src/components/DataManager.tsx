"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Trash2, FileSpreadsheet } from "lucide-react";
import { api } from "@/lib/ui";

type ImportRow = { id: number; file_name: string; data_json: string; created_at: string };

interface DataManagerProps {
  open: boolean;
  onClose: () => void;
}

export function DataManager({ open, onClose }: DataManagerProps) {
  const [imports, setImports] = useState<ImportRow[]>([]);

  const load = useCallback(() => {
    api<ImportRow[]>("/api/imports").then(setImports).catch(() => {});
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);

  async function handleDelete(id: number) {
    await fetch(`/api/imports/${id}`, { method: "DELETE" });
    load();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl shadow-gray-300/30 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Quản lý dữ liệu</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-100">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          <p className="mb-3 text-sm text-gray-500">
            Các file Excel đã tải lên hệ thống
          </p>
          {imports.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Chưa có file nào được thêm
            </p>
          ) : (
            <div className="space-y-2">
              {imports.map((imp) => (
                <div
                  key={imp.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3 transition-all hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileSpreadsheet className="size-5 shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{imp.file_name}</p>
                      <p className="text-xs text-gray-400">
                        File Excel · {new Date(imp.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(imp.id)}
                    className="shrink-0 rounded-xl p-1.5 text-gray-400 transition-colors hover:text-red-500 hover:bg-red-50"
                    title="Xoá"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}