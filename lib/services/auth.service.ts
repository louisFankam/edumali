import { findUserByEmail, findUserById } from "@/lib/repositories/user.repository";
import { verifyPassword } from "@/lib/auth/password";

export async function authenticateUser(username: string, password: string) {
  const user = await findUserByEmail(username);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  };
}

export async function getAuthenticatedUser(userId: number) {
  const user = await findUserById(userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  };
}
