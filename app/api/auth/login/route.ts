import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/schemas";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed, remaining } = rateLimit(`login:${ip}`);

    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: "Trop de tentatives. Réessayez dans une minute." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

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
      return NextResponse.json(
        { ok: false, message: "Nom d'utilisateur ou mot de passe incorrect." },
        { status: 401, headers: { "X-RateLimit-Remaining": String(remaining) } },
      );
    }

    await createSession(user.id, parsed.data.rememberMe);
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
