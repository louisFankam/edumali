import { db } from "@/lib/db";
import { evaluations, classes, subjects, academicYears, grades } from "@/lib/models/schema";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface EvaluationFilters {
  classId?: number;
  subjectId?: number;
  trimester?: number;
  academicYearId?: number;
  status?: string;
  type?: string;
}

function buildConditions(filters?: EvaluationFilters) {
  const conditions = [];
  if (filters?.classId) conditions.push(eq(evaluations.classId, filters.classId));
  if (filters?.subjectId) conditions.push(eq(evaluations.subjectId, filters.subjectId));
  if (filters?.trimester) conditions.push(eq(evaluations.trimester, filters.trimester));
  if (filters?.academicYearId) conditions.push(eq(evaluations.academicYearId, filters.academicYearId));
  if (filters?.status) conditions.push(eq(evaluations.status, filters.status));
  if (filters?.type) conditions.push(eq(evaluations.type, filters.type));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function findAllEvaluations(filters?: EvaluationFilters) {
  const where = buildConditions(filters);
  return db.select({
    id: evaluations.id,
    name: evaluations.name,
    type: evaluations.type,
    classId: evaluations.classId,
    subjectId: evaluations.subjectId,
    trimester: evaluations.trimester,
    academicYearId: evaluations.academicYearId,
    date: evaluations.date,
    status: evaluations.status,
    createdAt: evaluations.createdAt,
    updatedAt: evaluations.updatedAt,
    className: classes.name,
    subjectName: subjects.name,
  }).from(evaluations)
    .leftJoin(classes, eq(evaluations.classId, classes.id))
    .leftJoin(subjects, eq(evaluations.subjectId, subjects.id))
    .where(where)
    .orderBy(desc(evaluations.date));
}

export async function findEvaluationById(id: number) {
  const rows = await db.select().from(evaluations).where(eq(evaluations.id, id)).limit(1);
  return rows[0] || null;
}

export async function createEvaluation(input: {
  name: string; type: string; classId: number; subjectId: number;
  trimester: number; academicYearId: number; date: string;
}) {
  const [created] = await db.insert(evaluations).values(input).returning();
  return created;
}

export async function updateEvaluation(id: number, input: Partial<{
  name: string; type: string; classId: number; subjectId: number;
  trimester: number; date: string; status: string;
}>) {
  const [updated] = await db.update(evaluations).set({ ...input, updatedAt: new Date() }).where(eq(evaluations.id, id)).returning();
  return updated;
}

export async function deleteEvaluation(id: number) {
  await db.delete(grades).where(eq(grades.evaluationId, id));
  await db.delete(evaluations).where(eq(evaluations.id, id));
}

export async function countEvaluations(filters?: EvaluationFilters) {
  const where = buildConditions(filters);
  const rows = await db.select({ total: count() }).from(evaluations).where(where);
  return rows[0]?.total ?? 0;
}

export async function findEvaluationsByClassAndTrimester(classId: number, trimester: number, academicYearId: number) {
  return db.select({
    id: evaluations.id,
    name: evaluations.name,
    type: evaluations.type,
    subjectId: evaluations.subjectId,
    date: evaluations.date,
    status: evaluations.status,
  }).from(evaluations)
    .where(and(
      eq(evaluations.classId, classId),
      eq(evaluations.trimester, trimester),
      eq(evaluations.academicYearId, academicYearId),
    ));
}
