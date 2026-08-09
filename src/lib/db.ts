import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;

function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  const client = neon(DATABASE_URL);
  return client(strings, ...values);
}

export type Note = {
  id: number;
  date: string;
  time: string | null;
  content: string;
  created_at: string;
};

export type Import = {
  id: number;
  file_name: string;
  data_json: string;
  created_at: string;
};

export type Price = {
  id: number;
  name: string;
  price: number | null;
  unit: string | null;
  note: string | null;
  date: string | null;
  created_at: string;
};

export { sql };
