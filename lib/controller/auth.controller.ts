import { loginSchema } from "@/lib/validations/schemas";
import { authenticateUser, getAuthenticatedUser } from "@/lib/services/auth.service";
import { clearSession, createSession, getSessionUserId } from "@/lib/auth/session";

export async function loginController(payload: unknown) {
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      message: "Payload de connexion invalide.",
    };
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password);
  if (!user) {
    return {
      ok: false as const,
      status: 401,
      message: "Email ou mot de passe incorrect.",
    };
  }

  await createSession(user.id, parsed.data.rememberMe);

  return {
    ok: true as const,
    status: 200,
    user,
  };
}

export async function logoutController() {
  await clearSession();
  return { ok: true as const, status: 200 };
}

export async function sessionController() {
  const userId = await getSessionUserId();
  if (!userId) {
    return {
      ok: false as const,
      status: 401,
      user: null,
    };
  }

  const user = await getAuthenticatedUser(userId);
  if (!user) {
    await clearSession();
    return {
      ok: false as const,
      status: 401,
      user: null,
    };
  }

  return {
    ok: true as const,
    status: 200,
    user,
  };
}
