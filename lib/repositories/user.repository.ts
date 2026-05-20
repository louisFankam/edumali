import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/models/schema";

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function findUserById(id: number) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export async function countUsers(): Promise<number> {
  const rows = await db.select({ id: users.id }).from(users);
  return rows.length;
}

export async function createUser(input: {
  email: string;
  fullName: string;
  passwordHash: string;
}) {
  const [created] = await db
    .insert(users)
    .values({
      email: input.email,
      fullName: input.fullName,
      passwordHash: input.passwordHash,
    })
    .returning();

  return created;
}

export async function updateUserPasswordHash(id: number, passwordHash: string) {
  await db.update(users).set({ passwordHash }).where(eq(users.id, id));
}
