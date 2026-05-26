import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Payload de connexion invalide." }, { status: 400 });
    }

    const [{ authenticateUser }, { createSession }] = await Promise.all([
      import("@/lib/services/auth.service"),
      import("@/lib/auth/session"),
    ]);

    const user = await authenticateUser(parsed.data.username, parsed.data.password);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Nom d'utilisateur ou mot de passe incorrect." }, { status: 401 });
    }

    await createSession(user.id, parsed.data.rememberMe);
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
