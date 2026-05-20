import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const { clearSession } = await import("@/lib/auth/session");
  await clearSession();
  return NextResponse.json({ ok: true });
}
