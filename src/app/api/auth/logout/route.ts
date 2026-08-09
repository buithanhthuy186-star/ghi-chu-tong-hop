import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL("/login", req.url));
}
