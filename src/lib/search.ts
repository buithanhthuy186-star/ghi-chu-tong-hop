// Bỏ dấu tiếng Việt + lowercase để match tương đối:
// "nang ha" khớp "Nâng hạ", "giá" khớp "gia"
export function normalizeVi(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

// Chế độ 1 "tách từ": mỗi từ trong query phải xuất hiện (substring) trong text,
// không cần đứng liền nhau, không cần đúng thứ tự.
export function wordsMatch(query: string, text: string): boolean {
  const tokens = normalizeVi(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return false;
  const hay = normalizeVi(text);
  return tokens.every((t) => hay.includes(t));
}

// Chế độ 2 "cả cụm từ": toàn bộ cụm query phải xuất hiện liền nhau trong text.
export function phraseMatch(query: string, text: string): boolean {
  const q = normalizeVi(query);
  if (!q) return false;
  return normalizeVi(text).includes(q);
}

export function searchMatch(query: string, text: string, mode: "words" | "phrase"): boolean {
  return mode === "phrase" ? phraseMatch(query, text) : wordsMatch(query, text);
}
