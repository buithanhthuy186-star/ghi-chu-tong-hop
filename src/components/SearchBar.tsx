"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  mode: "words" | "phrase";
  onModeChange: (mode: "words" | "phrase") => void;
}

export function SearchBar({ value, onChange, mode, onModeChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="glass-panel space-y-2 p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={mode === "words"
            ? "Tìm tách từ: 'chống thấm betong' → dữ liệu chứa cả 3 từ..."
            : "Tìm cả cụm: 'giá sơn' → phải khớp đúng cụm..."}
          className="w-full rounded-xl border border-gray-200/50 bg-white/50 pl-10 pr-10 py-2.5 text-sm text-gray-900 outline-none backdrop-blur-sm transition-all focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200/50"
        />
        {value && (
          <button onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:text-gray-600">
            <X className="size-3.5" />
          </button>
        )}
        {!value && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 sm:inline-flex">
            Ctrl+K
          </kbd>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>Chế độ:</span>
        <button
          onClick={() => onModeChange("words")}
          className={`rounded-full px-3 py-1 font-medium transition-all duration-300 ${
            mode === "words"
              ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          🔤 Tách từ
        </button>
        <button
          onClick={() => onModeChange("phrase")}
          className={`rounded-full px-3 py-1 font-medium transition-all duration-300 ${
            mode === "phrase"
              ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📌 Cả cụm
        </button>
      </div>
    </div>
  );
}