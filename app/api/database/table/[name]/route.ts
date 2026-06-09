import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { findUserById } from "@/lib/repositories/user.repository";
import { verifyPassword } from "@/lib/auth/password";
import { clearTable, getDatabaseStats } from "@/lib/db";
import { requireApiAdmin } from "@/lib/guards/api-admin.guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROTECTED_TABLES = ["users", "academic_years", "school_info"];

export async function DELETE(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const { name } = await params;

    if (PROTECTED_TABLES.includes(name)) {
      return NextResponse.json({ ok: false, message: `La table '${name}' ne peut pas être vidée` }, { status: 403 });
    }

    const tables = getDatabaseStats().tables;
    if (!tables.find(t => t.name === name)) {
      return NextResponse.json({ ok: false, message: `Table '${name}' introuvable` }, { status: 404 });
    }

    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Non connecté" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;
    if (!password) {
      return NextResponse.json({ ok: false, message: "Mot de passe requis" }, { status: 400 });
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Utilisateur introuvable" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ ok: false, message: "Mot de passe incorrect" }, { status: 403 });
    }

    const deletedCount = clearTable(name);

    return NextResponse.json({ ok: true, deletedCount });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
