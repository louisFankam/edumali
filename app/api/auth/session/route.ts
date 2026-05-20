import { NextResponse } from "next/server";
import { decodeSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;

  const cookies = header.split(";").map((item) => item.trim());
  const match = cookies.find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export async function GET(request: Request) {
  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (!token) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  const payload = await decodeSessionToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  const { getAuthenticatedUser } = await import("@/lib/services/auth.service");
  const user = await getAuthenticatedUser(payload.uid);
  if (!user) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user }, { status: 200 });
}
