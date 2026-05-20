import { cookies } from "next/headers";
import { decodeSessionToken, encodeSessionToken, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/session-token";

export async function createSession(userId: number, rememberMe = false): Promise<void> {
  const expiresIn = rememberMe ? SESSION_TTL_SECONDS * 7 : SESSION_TTL_SECONDS;
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const token = await encodeSessionToken({ uid: userId, exp });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const payload = await decodeSessionToken(raw);
  return payload?.uid ?? null;
}
