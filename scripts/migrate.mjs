// scripts/migrate.mjs — Tạo bảng trên Neon Postgres
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Thiếu DATABASE_URL trong .env.local');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('Đang tạo bảng trên Neon...');

  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('  ✓ notes');

  await sql`
    CREATE TABLE IF NOT EXISTS prices (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL,
      unit TEXT,
      note TEXT,
      date TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('  ✓ prices');

  await sql`
    CREATE TABLE IF NOT EXISTS imports (
      id SERIAL PRIMARY KEY,
      file_name TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('  ✓ imports');

  console.log('Migration hoàn tất!');
}

migrate().catch((e) => {
  console.error('Migration lỗi:', e);
  process.exit(1);
});