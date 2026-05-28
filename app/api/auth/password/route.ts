import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères").max(128),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export async function PUT(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Non authentifié." }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = changePasswordSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({
        ok: false,
        message: "Données invalides.",
        errors: parsed.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const [
      { findUserById },
      { verifyPassword, hashPassword },
      { updateUserPasswordHash },
    ] = await Promise.all([
      import("@/lib/repositories/user.repository"),
      import("@/lib/auth/password"),
      import("@/lib/repositories/user.repository"),
    ]);

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Utilisateur introuvable." }, { status: 404 });
    }

    const isValid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ ok: false, message: "Mot de passe actuel incorrect." }, { status: 403 });
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await updateUserPasswordHash(userId, newHash);

    return NextResponse.json({ ok: true, message: "Mot de passe modifié avec succès." });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
