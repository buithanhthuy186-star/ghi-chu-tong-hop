export type Note = { id: number; date: string; time: string | null; content: string; created_at: string };
export type Price = {
  id: number;
  name: string;
  price: number | null;
  unit: string | null;
  note: string | null;
  date: string | null;
};

export const pad = (n: number) => String(n).padStart(2, "0");

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const fmtMoney = (v: number | null) =>
  v === null || Number.isNaN(v) ? "" : v.toLocaleString("vi-VN");

export async function api<T = unknown>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error || res.statusText);
  }
  return res.json();
}
