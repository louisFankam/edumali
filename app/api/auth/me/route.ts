import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  full_name: z.string().trim().min(1, "Le nom complet est requis").max(200),
  username: z.string().trim().min(1, "Le nom d'utilisateur est requis").max(254),
});

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    const { findUserById } = await import("@/lib/repositories/user.repository");
    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        created_at: user.createdAt?.getTime() ?? null,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Non authentifié." }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Données invalides.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { updateUser } = await import("@/lib/repositories/user.repository");
    const updated = await updateUser(userId, {
      email: parsed.data.username,
      fullName: parsed.data.full_name,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        email: updated.email,
        full_name: updated.fullName,
        created_at: updated.createdAt?.getTime() ?? null,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
