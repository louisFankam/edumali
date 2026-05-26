import { db } from "@/lib/db";
import { grades, students, evaluations, enrollments } from "@/lib/models/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function findGradesByEvaluation(evaluationId: number) {
  return db.select({
    id: grades.id,
    evaluationId: grades.evaluationId,
    studentId: grades.studentId,
    score: grades.score,
    remarks: grades.remarks,
    isAbsent: grades.isAbsent,
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
  studentId: number; score: number; remarks?: string; isAbsent?: boolean;
}[]) {
  await db.delete(grades).where(eq(grades.evaluationId, evaluationId));
  if (gradeInputs.length === 0) return [];
  const values = gradeInputs.map(g => ({
    evaluationId,
    studentId: g.studentId,
    score: g.score,
    remarks: g.remarks || null,
    isAbsent: g.isAbsent ? 1 : 0,
  }));
  const inserted = await db.insert(grades).values(values).returning();
  return inserted;
}

export async function findGradesByEvaluations(evaluationIds: number[]) {
  if (evaluationIds.length === 0) return [];
  return db.select({
    id: grades.id,
    evaluationId: grades.evaluationId,
    studentId: grades.studentId,
    score: grades.score,
    remarks: grades.remarks,
    isAbsent: grades.isAbsent,
    createdAt: grades.createdAt,
    updatedAt: grades.updatedAt,
    studentFirstName: students.firstName,
    studentLastName: students.lastName,
  }).from(grades)
    .innerJoin(students, eq(grades.studentId, students.id))
    .where(inArray(grades.evaluationId, evaluationIds))
    .orderBy(students.lastName, students.firstName);
}

export async function deleteGrade(id: number) {
  await db.delete(grades).where(eq(grades.id, id));
}

export async function countStudentsByEvaluation(evaluationId: number) {
  const rows = await db.select({
    total: sql<number>`count(distinct ${enrollments.studentId})`,
  }).from(enrollments)
    .innerJoin(evaluations, and(
      eq(evaluations.classId, enrollments.classId),
      eq(evaluations.academicYearId, enrollments.academicYearId),
    ))
    .where(and(
      eq(evaluations.id, evaluationId),
      eq(enrollments.status, "inscrit"),
    ));
  return rows[0]?.total ?? 0;
}

export async function countAbsentByEvaluation(evaluationId: number) {
  const rows = await db.select({
    total: sql<number>`count(*)`,
  }).from(grades).where(
    and(eq(grades.evaluationId, evaluationId), eq(grades.isAbsent, 1))
  );
  return rows[0]?.total ?? 0;
}
