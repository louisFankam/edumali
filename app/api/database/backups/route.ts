import { NextResponse } from "next/server";
import { getBackups, createBackup } from "@/lib/backup";
import { requireApiAdmin } from "@/lib/guards/api-admin.guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const backups = getBackups();
    return NextResponse.json({ ok: true, data: backups });
  } catch (e) {
    return NextResponse.json({ ok: false, message: String(e) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const backup = createBackup();
    return NextResponse.json({ ok: true, data: backup });
  } catch (e) {
    return NextResponse.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
