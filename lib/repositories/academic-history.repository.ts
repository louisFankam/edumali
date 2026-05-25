import { db } from "@/lib/db";
import { academicHistories } from "@/lib/models/schema";
import { eq, desc } from "drizzle-orm";

export async function findHistoriesByStudentId(studentId: number) {
  return db.select().from(academicHistories).where(eq(academicHistories.studentId, studentId)).orderBy(desc(academicHistories.createdAt));
}

export async function createHistory(studentId: number, input: {
  schoolName: string; className?: string; academicYear?: string; reason?: string; remarks?: string;
}) {
  const [created] = await db.insert(academicHistories).values({ studentId, ...input }).returning();
  return created;
}

export async function updateHistory(id: number, input: Partial<{
  schoolName: string; className: string; academicYear: string; reason: string; remarks: string;
}>) {
  const [updated] = await db.update(academicHistories).set({ ...input, updatedAt: new Date() }).where(eq(academicHistories.id, id)).returning();
  return updated;
}

export async function deleteHistory(id: number) {
  await db.delete(academicHistories).where(eq(academicHistories.id, id));
}
