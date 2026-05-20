import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { checkDatabaseConnection } = await import("@/lib/db");
  const ok = await checkDatabaseConnection();
  return NextResponse.json({ ok, message: ok ? "DB connected" : "DB connection failed" }, { status: ok ? 200 : 500 });
}
