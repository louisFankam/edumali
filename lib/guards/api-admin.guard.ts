import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { findUserById } from "@/lib/repositories/user.repository";

export async function requireApiAdmin() {
  const userId = await getSessionUserId();
  if (!userId) {
    return { error: NextResponse.json({ ok: false, message: "Non connecté" }, { status: 401 }), userId: null };
  }

  const user = await findUserById(userId);
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ ok: false, message: "Accès réservé à l'administration" }, { status: 403 }), userId: null };
  }

  return { error: null, userId };
}
