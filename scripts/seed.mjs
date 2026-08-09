import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "lichgau.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL,
    unit TEXT,
    note TEXT,
    date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec("DELETE FROM notes; DELETE FROM prices;");

const notes = [
  ["2026-08-05", "10:00", "Nhắc gia hạn hợp đồng thuê kho trước ngày 20"],
  ["2026-08-09", "09:00", "Khảo sát công trình mái tôn nhà xưởng Bình Dương"],
  ["2026-08-09", "15:30", "Gọi báo giá chống thấm sân thượng cho anh Hùng"],
  ["2026-08-12", null, "Đi lấy mẫu cont hàng mới tại cảng"],
  ["2026-08-15", "08:00", "Họp đội thi công - chuẩn bị vật tư AQURON"],
  ["2026-08-20", "14:00", "Nghiệm thu hạng mục nâng hạ cont kho 3"],
];
const insNote = db.prepare("INSERT INTO notes (date, time, content) VALUES (?, ?, ?)");
for (const [date, time, content] of notes) insNote.run(date, time, content);

const prices = [
  ["Giá nâng hạ cont 20ft", 1200000, "VND/lượt", "Giá tại bãi, chưa VAT", "2026-08-01"],
  ["Giá nâng hạ cont 40ft", 1800000, "VND/lượt", "Giá tại bãi, chưa VAT", "2026-08-01"],
  ["Giá nâng hạ cont lạnh 40ft", 2200000, "VND/lượt", "Cần xe cẩu chuyên dụng", "2026-08-01"],
  ["Vận chuyển cont nội thành HCM", 2500000, "VND/chuyến", "Dưới 30km", "2026-08-01"],
  ["Phí lưu cont tại bãi", 150000, "VND/ngày", "Miễn phí 2 ngày đầu", "2026-08-01"],
  ["Giá thuê xe cẩu nâng hạ", 3500000, "VND/ca", "Ca 8 tiếng", "2026-08-01"],
  ["Chống thấm sân thượng AQURON", 180000, "VND/m2", "Đã gồm công + vật tư", "2026-08-05"],
  ["Keo trám khe co giãn", 85000, "VND/tuýp", "Tuýp 600ml", "2026-08-05"],
];
const insPrice = db.prepare("INSERT INTO prices (name, price, unit, note, date) VALUES (?, ?, ?, ?, ?)");
for (const [name, price, unit, note, date] of prices) insPrice.run(name, price, unit, note, date);

console.log(`Seeded: ${notes.length} notes, ${prices.length} prices -> ${dbPath}`);
