import { db } from "@/lib/db";
import { grades, students } from "@/lib/models/schema";
import { eq, and } from "drizzle-orm";

export async function findGradesByEvaluation(evaluationId: number) {
  return db.select({
    id: grades.id,
    evaluationId: grades.evaluationId,
    studentId: grades.studentId,
    score: grades.score,
    remarks: grades.remarks,
    createdAt: grades.createdAt,
    updatedAt: grades.updatedAt,
    studentFirstName: students.firstName,
    studentLastName: students.lastName,
  }).from(grades)
    .innerJoin(students, eq(grades.studentId, students.id))
    .where(eq(grades.evaluationId, evaluationId))
    .orderBy(students.lastName, students.firstName);
}

export async function findGradeByEvalAndStudent(evaluationId: number, studentId: number) {
  const rows = await db.select().from(grades)
    .where(and(eq(grades.evaluationId, evaluationId), eq(grades.studentId, studentId)))
    .limit(1);
  return rows[0] || null;
}

export async function bulkSaveGrades(evaluationId: number, gradeInputs: {
  studentId: number; score: number; remarks?: string;
}[]) {
  await db.delete(grades).where(eq(grades.evaluationId, evaluationId));
  if (gradeInputs.length === 0) return [];
  const values = gradeInputs.map(g => ({
    evaluationId,
    studentId: g.studentId,
    score: g.score,
    remarks: g.remarks || null,
  }));
  const inserted = await db.insert(grades).values(values).returning();
  return inserted;
}

export async function deleteGrade(id: number) {
  await db.delete(grades).where(eq(grades.id, id));
}
