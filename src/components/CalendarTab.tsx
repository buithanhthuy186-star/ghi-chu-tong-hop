"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api, pad, todayStr, type Note } from "@/lib/ui";
import { LiquidMetalButton } from "./liquid-metal-button";
import { MetalToggle } from "./metal-toggle";
import { NotePanel } from "./NotePanel";

type ViewMode = "year" | "month" | "day";

const DAY_NAMES = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export default function CalendarTab() {
  const now = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(todayStr());
  const [yearNotes, setYearNotes] = useState<Note[]>([]);
  const [dayNotes, setDayNotes] = useState<Note[]>([]);

  const monthKey = `${year}-${pad(month + 1)}`;

  const loadYear = useCallback(() => {
    api<Note[]>(`/api/notes?year=${year}`).then(setYearNotes).catch(() => {});
  }, [year]);
  const loadDay = useCallback(() => {
    api<Note[]>(`/api/notes?date=${selected}`).then(setDayNotes).catch(() => {});
  }, [selected]);

  useEffect(() => { loadYear(); }, [loadYear]);
  useEffect(() => { loadDay(); }, [loadDay]);
  const reload = () => { loadYear(); loadDay(); };

  const noteDates = useMemo(() => new Set(yearNotes.map((n) => n.date)), [yearNotes]);
  const monthCounts = useMemo(() => {
    const c = new Array(12).fill(0);
    for (const n of yearNotes) c[Number(n.date.slice(5, 7)) - 1]++;
    return c;
  }, [yearNotes]);

  const monthCells = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const arr: (string | null)[] = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= days; d++) arr.push(`${year}-${pad(month + 1)}-${pad(d)}`);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  const goToday = () => {
    const n = new Date();
    setSelected(`${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`);
    setMonth(n.getMonth()); setYear(n.getFullYear());
    setViewMode("month");
  };

  const shift = (dir: -1 | 1) => {
    if (viewMode === "year") setYear(year + dir);
    else if (viewMode === "month") {
      const m = month + dir;
      if (m < 0) { setMonth(11); setYear(year - 1); }
      else if (m > 11) { setMonth(0); setYear(year + 1); }
      else setMonth(m);
    } else {
      const d = new Date(selected + "T00:00:00");
      d.setDate(d.getDate() + dir);
      setSelected(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
      setYear(d.getFullYear()); setMonth(d.getMonth());
    }
  };

  const centerLabel =
    viewMode === "year" ? `Năm ${year}` :
    viewMode === "month" ? `Tháng ${month + 1} / ${year}` :
    `${DAY_NAMES[new Date(selected + "T00:00:00").getDay()]}, ${selected.split("-").reverse().join("/")}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MetalToggle
            options={[
              { key: "year", label: "Năm" },
              { key: "month", label: "Tháng" },
              { key: "day", label: "Ngày" },
            ]}
            value={viewMode}
            onChange={setViewMode}
            optionWidth={84}
          />
          <LiquidMetalButton label="Hôm nay" width={110} onClick={goToday} />
        </div>
        <div className="flex items-center gap-3">
          <LiquidMetalButton label="Lùi" viewMode="icon" icon={<ChevronLeft size={16} style={{ color: "#8a8a8a" }} />} onClick={() => shift(-1)} />
          <div className="min-w-[220px] text-center font-semibold text-zinc-100">{centerLabel}</div>
          <LiquidMetalButton label="Tiến" viewMode="icon" icon={<ChevronRight size={16} style={{ color: "#8a8a8a" }} />} onClick={() => shift(1)} />
        </div>
      </div>

      {viewMode === "year" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {monthCounts.map((count, i) => (
            <button
              key={i}
              onClick={() => { setMonth(i); setViewMode("month"); }}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-left transition hover:border-zinc-500"
            >
              <div className="font-semibold text-zinc-100">Tháng {i + 1}</div>
              <div className="mt-1 text-sm text-zinc-500">{count > 0 ? `${count} ghi chú` : "Trống"}</div>
              {count > 0 && (
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: Math.min(count, 5) }).map((_, j) => (
                    <span key={j} className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {viewMode === "month" && (
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthCells.map((dateStr, i) =>
                dateStr === null ? (
                  <div key={i} />
                ) : (
                  <button
                    key={i}
                    onClick={() => setSelected(dateStr)}
                    className={`relative h-14 rounded-xl border text-sm transition ${
                      dateStr === selected
                        ? "border-zinc-300 bg-zinc-300/10 font-semibold text-white selected-day-glow"
                        : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {Number(dateStr.slice(8))}
                    {noteDates.has(dateStr) && (
                      <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-zinc-200" />
                    )}
                  </button>
                )
              )}
            </div>
          </section>
          <NotePanel date={selected} notes={dayNotes} onChanged={reload} />
        </div>
      )}

      {viewMode === "day" && (
        <div className="mx-auto max-w-2xl">
          <NotePanel date={selected} notes={dayNotes} onChanged={reload} />
        </div>
      )}
    </div>
  );
}