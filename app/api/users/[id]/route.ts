import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/guards/api-admin.guard";
import { findUserById, updateUser, deleteUser } from "@/lib/repositories/user.repository";
import { logAudit } from "@/lib/services/audit.service";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis").max(200).optional(),
  role: z.enum(["admin", "manager"]).optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error, userId: auditUserId } = await requireApiAdmin();
    if (error) return error;

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ ok: false, message: "ID invalide." }, { status: 400 });
    }

    const existing = await findUserById(userId);
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Utilisateur introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Données invalides.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    if (auditUserId === userId && parsed.data.role !== undefined) {
      return NextResponse.json({ ok: false, message: "Vous ne pouvez pas modifier votre propre rôle." }, { status: 403 });
    }

    const updated = await updateUser(userId, parsed.data);

    await logAudit({
      tableName: "users",
      recordId: userId,
      action: "update",
      userId: auditUserId ?? undefined,
      oldValues: { email: existing.email, fullName: existing.fullName, role: existing.role },
      newValues: { email: updated.email, fullName: updated.fullName, role: updated.role },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireApiAdmin();
    if (error) return error;

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ ok: false, message: "ID invalide." }, { status: 400 });
    }

    const existing = await findUserById(userId);
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Utilisateur introuvable." }, { status: 404 });
    }

    if (existing.role === "admin") {
      const { findAllUsers } = await import("@/lib/repositories/user.repository");
      const allUsers = await findAllUsers();
      const admins = allUsers.filter(u => u.role === "admin");
      if (admins.length <= 1) {
        return NextResponse.json({ ok: false, message: "Impossible de supprimer le dernier administrateur." }, { status: 403 });
      }
    }

    const oldUser = { email: existing.email, fullName: existing.fullName, role: existing.role };
    await deleteUser(userId);

    const auditUserId = await import("@/lib/auth/session").then(m => m.getSessionUserId());
    await logAudit({
      tableName: "users",
      recordId: userId,
      action: "delete",
      userId: auditUserId ?? undefined,
      oldValues: oldUser,
    });

    return NextResponse.json({ ok: true, message: "Utilisateur supprimé." });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
