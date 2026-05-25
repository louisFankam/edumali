import { db } from "@/lib/db";
import { classSubjects, subjects } from "@/lib/models/schema";
import { eq, and } from "drizzle-orm";

export async function findSubjectsByClassId(classId: number) {
  return db.select({
    id: classSubjects.id,
    classId: classSubjects.classId,
    subjectId: classSubjects.subjectId,
    coefficient: classSubjects.coefficient,
    subjectName: subjects.name,
    subjectCode: subjects.code,
  }).from(classSubjects)
    .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
    .where(eq(classSubjects.classId, classId))
    .orderBy(subjects.name);
}

export async function assignSubjectToClass(classId: number, subjectId: number, coefficient: number = 1) {
  const [created] = await db.insert(classSubjects)
    .values({ classId, subjectId, coefficient })
    .returning();
  return created;
}

export async function bulkAssignSubjects(classId: number, assignments: { subjectId: number; coefficient: number }[]) {
  await db.delete(classSubjects).where(eq(classSubjects.classId, classId));
  if (assignments.length === 0) return [];
  const values = assignments.map(a => ({ classId, subjectId: a.subjectId, coefficient: a.coefficient }));
  const inserted = await db.insert(classSubjects).values(values).returning();
  return inserted;
}

export async function removeSubjectFromClass(classId: number, subjectId: number) {
  await db.delete(classSubjects).where(
    and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId))
  );
}

export async function hasSubjectInClass(classId: number, subjectId: number) {
  const rows = await db.select({ id: classSubjects.id }).from(classSubjects)
    .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
    .limit(1);
  return rows.length > 0;
}
