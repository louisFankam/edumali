import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { findUserById } from "@/lib/repositories/user.repository";
import { editAcademicHistory, removeAcademicHistory } from "@/lib/services/academic-history.service";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  schoolName: z.string().min(1).optional(),
  className: z.string().optional(),
  academicYear: z.string().optional(),
  reason: z.string().optional(),
  remarks: z.string().optional(),
});

async function requireModifySession() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, message: "Non connecté" }, { status: 401 });
  const user = await findUserById(userId);
  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return NextResponse.json({ ok: false, message: "Accès refusé" }, { status: 403 });
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireModifySession();
    if (authError) return authError;

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Données invalides.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = await editAcademicHistory(id, parsed.data);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireModifySession();
    if (authError) return authError;

    const { id } = await params;
    await removeAcademicHistory(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
