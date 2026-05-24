import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes } from "@/lib/models/schema";

export async function findAllClasses() {
  return db.query.classes.findMany({ orderBy: (c, { asc }) => [asc(c.name)] });
}

export async function findClassById(id: number) {
  return db.query.classes.findFirst({ where: eq(classes.id, id) });
}

export async function createClass(input: { name: string; level?: number | null }) {
  const [created] = await db.insert(classes).values(input).returning();
  return created;
}

export async function updateClass(id: number, input: { name?: string; level?: number | null }) {
  const [updated] = await db.update(classes).set({ ...input, updatedAt: new Date() }).where(eq(classes.id, id)).returning();
  return updated;
}

export async function deleteClass(id: number) {
  await db.delete(classes).where(eq(classes.id, id));
}
