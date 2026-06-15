import { db } from "@/lib/db";
import { classSubjects, subjects, teachers } from "@/lib/models/schema";
import { eq, and, sql } from "drizzle-orm";

export async function findSubjectsByClassId(classId: number) {
  return db.select({
    id: classSubjects.id,
    classId: classSubjects.classId,
    subjectId: classSubjects.subjectId,
    coefficient: classSubjects.coefficient,
    teacherId: classSubjects.teacherId,
    subjectName: subjects.name,
    subjectCode: subjects.code,
    teacherName: sql<string>`${teachers.firstName} || ' ' || ${teachers.lastName}`,
  }).from(classSubjects)
    .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
    .leftJoin(teachers, eq(classSubjects.teacherId, teachers.id))
    .where(eq(classSubjects.classId, classId))
    .orderBy(subjects.name);
}

export async function assignSubjectToClass(classId: number, subjectId: number, coefficient: number = 1, teacherId?: number | null) {
  const [created] = await db.insert(classSubjects)
    .values({ classId, subjectId, coefficient, teacherId: teacherId ?? null })
    .returning();
  return created;
}

export async function bulkAssignSubjects(classId: number, assignments: { subjectId: number; coefficient: number; teacherId?: number | null }[]) {
  await db.delete(classSubjects).where(eq(classSubjects.classId, classId));
  if (assignments.length === 0) return [];
  const values = assignments.map(a => ({ classId, subjectId: a.subjectId, coefficient: a.coefficient, teacherId: a.teacherId ?? null }));
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

export async function updateClassSubjectTeacher(classSubjectId: number, teacherId: number | null) {
  const [updated] = await db
    .update(classSubjects)
    .set({ teacherId })
    .where(eq(classSubjects.id, classSubjectId))
    .returning();
  return updated;
}

export async function updateTeacherForSubjectInClass(classId: number, subjectId: number, teacherId: number | null) {
  const [updated] = await db
    .update(classSubjects)
    .set({ teacherId })
    .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
    .returning();
  return updated;
}
