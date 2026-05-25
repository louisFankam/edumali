import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subjects } from "@/lib/models/schema";

export async function findAllSubjects() {
  return db.query.subjects.findMany({ orderBy: (s, { asc }) => [asc(s.name)] });
}

export async function findSubjectById(id: number) {
  return db.query.subjects.findFirst({ where: eq(subjects.id, id) });
}

export async function createSubject(input: {
  name: string;
  code?: string;
  coefficient?: number;
  hoursPerWeek?: number;
  description?: string;
  color?: string;
  status?: string;
}) {
  const [created] = await db.insert(subjects).values(input as any).returning();
  return created;
}

export async function updateSubject(id: number, input: {
  name?: string;
  code?: string;
  coefficient?: number;
  hoursPerWeek?: number;
  description?: string;
  color?: string;
  status?: string;
}) {
  const [updated] = await db
    .update(subjects)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(subjects.id, id))
    .returning();
  return updated;
}

export async function deleteSubject(id: number) {
  await db.delete(subjects).where(eq(subjects.id, id));
}
