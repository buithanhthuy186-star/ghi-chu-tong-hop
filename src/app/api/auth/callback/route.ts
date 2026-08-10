import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { encodeSession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = await cookies();
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = store.get("lichgau_oauth_state")?.value;
  store.delete("lichgau_oauth_state");

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=state", req.url));
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: `${process.env.APP_URL}/api/auth/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    return NextResponse.redirect(new URL(`/login?error=token&detail=${encodeURIComponent(errBody)}`, req.url));
  }
  const tokens = await tokenRes.json();

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) {
    return NextResponse.redirect(new URL("/login?error=userinfo", req.url));
  }
  const info = await infoRes.json();

  const session = encodeSession({
    sub: info.sub,
    email: info.email,
    name: info.name || info.email,
    picture: info.picture,
  });
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 86400,
    path: "/",
  });
  return res;
}
