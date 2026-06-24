import { NextResponse } from "next/server";
import { deleteBackup, restoreBackup } from "@/lib/backup";
import { requireApiAdmin } from "@/lib/guards/api-admin.guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const { name } = await params;
    deleteBackup(name);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: String(e) }, { status: 500 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const { name } = await params;
    const body = await _request.json();
    if (body.action === "restore") {
      restoreBackup(name);
      return NextResponse.json({
        ok: true,
        message: "Base de données restaurée. Veuillez redémarrer l'application.",
      });
    }
    return NextResponse.json({ ok: false, message: "Action invalide" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, message: String(e) }, { status: 500 });
  }
}
