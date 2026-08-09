"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fmtMoney, todayStr, type Price } from "@/lib/ui";
import { LiquidMetalButton } from "./liquid-metal-button";

const emptyForm = { name: "", price: "", unit: "", note: "", date: todayStr() };

export default function PricesTab() {
  const [rows, setRows] = useState<Price[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    api<Price[]>("/api/prices").then(setRows).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setErr("");
    if (!form.name.trim()) { setErr("Tên hàng/mục không được trống"); return; }
    try {
      const payload = { ...form, price: form.price === "" ? null : Number(form.price) };
      if (editId) await api(`/api/prices/${editId}`, "PATCH", payload);
      else await api("/api/prices", "POST", payload);
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch (e) {
      setErr(String((e as Error).message || e));
    }
  };

  const edit = (p: Price) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      price: p.price === null ? "" : String(p.price),
      unit: p.unit || "",
      note: p.note || "",
      date: p.date || "",
    });
  };

  const del = async (id: number) => {
    await api(`/api/prices/${id}`, "DELETE");
    if (editId === id) { setEditId(null); setForm(emptyForm); }
    load();
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <h2 className="mb-3 font-semibold">{editId ? "Sửa dòng giá" : "Thêm dòng giá"}</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input placeholder="Tên (vd: Giá nâng hạ cont)" value={form.name} onChange={set("name")}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm lg:col-span-2" />
          <input placeholder="Giá (số)" type="number" value={form.price} onChange={set("price")}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
          <input placeholder="Đơn vị (vd: VND/lượt)" value={form.unit} onChange={set("unit")}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
          <input type="date" value={form.date} onChange={set("date")}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
        </div>
        <input placeholder="Ghi chú thêm" value={form.note} onChange={set("note")}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
        {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
        <div className="mt-3 flex items-center gap-3">
          <LiquidMetalButton label={editId ? "Lưu thay đổi" : "Thêm vào bảng giá"} width={190} onClick={submit} />
          {editId && (
            <button onClick={() => { setEditId(null); setForm(emptyForm); }} className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
              Huỷ
            </button>
          )}
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-left text-zinc-400">
            <tr>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2 text-right">Giá</th>
              <th className="px-3 py-2">Đơn vị</th>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2">Ghi chú</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-zinc-500">Chưa có dữ liệu giá.</td></tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2 text-right tabular-nums text-zinc-100">{fmtMoney(p.price)}</td>
                <td className="px-3 py-2 text-zinc-400">{p.unit || ""}</td>
                <td className="px-3 py-2 text-zinc-400">{p.date || ""}</td>
                <td className="px-3 py-2 text-zinc-400">{p.note || ""}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  <button onClick={() => edit(p)} className="mr-2 text-xs text-zinc-400 hover:text-amber-300">Sửa</button>
                  <button onClick={() => del(p.id)} className="text-xs text-zinc-400 hover:text-red-400">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
