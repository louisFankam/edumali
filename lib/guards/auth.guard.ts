import { getSessionUserId } from "@/lib/auth/session";

export async function requireAuth() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return userId;
}
