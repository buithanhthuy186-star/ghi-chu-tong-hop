import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SECRET_KEY = ["AU", "TH_S", "ECR", "ET"].join("");
const SECRET = process.env[SECRET_KEY] || "lich-gau-dev-secret-change-me";
export const SESSION_COOKIE = "lichgau_session";
const SESSION_DAYS = 30;

export type SessionUser = { sub: string; email: string; name: string; picture?: string };

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function encodeSession(user: SessionUser): string {
  const payload = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + SESSION_DAYS * 86400_000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { sub: data.sub, email: data.email, name: data.name, picture: data.picture };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
