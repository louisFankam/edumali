import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getAuditLogs } from "@/lib/services/audit.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("tableName") ?? undefined;
    const action = searchParams.get("action") ?? undefined;
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const result = await getAuditLogs({ tableName, action, userId: undefined, from, to, page, limit });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
