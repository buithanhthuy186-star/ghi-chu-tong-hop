"use client";

import { useState, useRef } from "react";
import { Plus, Upload, Link, Database } from "lucide-react";
import { api, todayStr } from "@/lib/ui";
import { LiquidMetalButton } from "./liquid-metal-button";

interface UploadCardProps {
  onNoteAdded: () => void;
  onOpenDataManager: () => void;
  onUploadSuccess: (msg: string) => void;
}

export function UploadCard({ onNoteAdded, onOpenDataManager, onUploadSuccess }: UploadCardProps) {
  const [noteText, setNoteText] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [activeTab, setActiveTab] = useState<"note" | "excel" | "sheet">("note");
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAddNote() {
    const text = noteText.trim();
    if (!text) return;
    setAdding(true);
    await api("/api/notes", "POST", { date: todayStr(), content: text });
    setNoteText("");
    setAdding(false);
    onNoteAdded();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/imports", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    onUploadSuccess(`✅ Đã import "${data.file_name}" (${data.sheets} sheet, ${data.rows} dòng)`);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
    onNoteAdded();
  }

  async function handleAddSheet() {
    const url = sheetUrl.trim();
    if (!url) return;
    const name = sheetName.trim() || url;
    await api("/api/notes", "POST", {
      date: todayStr(),
      content: `📊 Google Sheet: ${name}\n${url}`,
    });
    setSheetUrl("");
    setSheetName("");
    onNoteAdded();
  }

  const tabs = [
    { key: "note" as const, label: "Thêm ghi chú", icon: Plus },
    { key: "excel" as const, label: "Upload Excel", icon: Upload },
    { key: "sheet" as const, label: "Google Sheet", icon: Link },
  ];

  return (
    <div className="card-glow rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
      {/* Tab bar — shader-button style */}
      <div className="flex gap-1 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
        <button
          onClick={onOpenDataManager}
          className="rounded-xl px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="Quản lý dữ liệu"
        >
          <Database className="size-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {activeTab === "note" && (
          <div className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập nội dung ghi chú... (Enter để lưu, Shift+Enter xuống dòng)"
              className="min-h-[80px] w-full resize-y rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-sm text-gray-900 outline-none backdrop-blur-sm transition-all focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200/50"
              rows={3}
            />
            <div className="flex justify-end">
              <LiquidMetalButton
                label={adding ? "Đang thêm..." : "Thêm ghi chú"}
                onClick={handleAddNote}
                width={160}
              />
            </div>
          </div>
        )}

        {activeTab === "excel" && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-all hover:border-gray-400">
            <Upload className="mx-auto size-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">Kéo thả file Excel hoặc click để chọn</p>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-gray-900/20 transition-all hover:bg-gray-800 hover:shadow-gray-900/30">
              {uploading ? "Đang tải..." : "Chọn file Excel"}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        )}

        {activeTab === "sheet" && (
          <div className="space-y-3">
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Tên Google Sheet (tuỳ chọn)"
              className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-2.5 text-sm text-gray-900 outline-none backdrop-blur-sm transition-all focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200/50"
            />
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Dán link Google Sheet..."
              className="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-2.5 text-sm text-gray-900 outline-none backdrop-blur-sm transition-all focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200/50"
            />
            <div className="flex justify-end">
              <LiquidMetalButton
                label="Thêm Google Sheet"
                onClick={handleAddSheet}
                width={180}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}