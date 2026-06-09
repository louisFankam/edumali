import { NextResponse } from "next/server";
import { getDatabaseStats } from "@/lib/db";
import { requireApiAdmin } from "@/lib/guards/api-admin.guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const data = getDatabaseStats();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
