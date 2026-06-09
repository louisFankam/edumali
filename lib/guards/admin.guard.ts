import { getSessionUserId } from "@/lib/auth/session";
import { findUserById } from "@/lib/repositories/user.repository";

export async function requireAdmin() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await findUserById(userId);
  if (!user || user.role !== "admin") return null;

  return userId;
}
