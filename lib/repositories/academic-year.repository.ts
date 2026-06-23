import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { academicYears, grades, evaluations, exams, schedules, enrollments, expenses } from "@/lib/models/schema";

export async function findAllAcademicYears() {
  return db.query.academicYears.findMany({ orderBy: (y, { desc }) => [desc(y.startDate)] });
}

export async function findAcademicYearById(id: number) {
  return db.query.academicYears.findFirst({ where: eq(academicYears.id, id) });
}

export async function findCurrentAcademicYear() {
  return db.query.academicYears.findFirst({ where: eq(academicYears.isCurrent, true) });
}

export async function createAcademicYear(input: {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}) {
  if (input.isCurrent) {
    await db.update(academicYears).set({ isCurrent: false });
  }
  const [created] = await db.insert(academicYears).values(input as any).returning();
  return created;
}

export async function updateAcademicYear(id: number, input: {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}) {
  if (input.isCurrent) {
    await db.update(academicYears).set({ isCurrent: false });
  }
  const [updated] = await db
    .update(academicYears)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(academicYears.id, id))
    .returning();
  return updated;
}

export async function findDependentRecordsCount(id: number) {
  const [result] = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM enrollments WHERE academic_year_id = ${id}) as enrollments,
      (SELECT COUNT(*) FROM evaluations WHERE academic_year_id = ${id}) as evaluations,
      (SELECT COUNT(*) FROM exams WHERE academic_year_id = ${id}) as exams,
      (SELECT COUNT(*) FROM schedules WHERE academic_year_id = ${id}) as schedules,
      (SELECT COUNT(*) FROM expenses WHERE academic_year_id = ${id}) as expenses
  `);
  return result as { enrollments: number; evaluations: number; exams: number; schedules: number; expenses: number };
}

export async function deleteAcademicYearCascade(id: number) {
  await db.delete(grades).where(sql`
    evaluation_id IN (SELECT id FROM evaluations WHERE academic_year_id = ${id})
  `);
  await db.delete(evaluations).where(eq(evaluations.academicYearId, id));
  await db.delete(exams).where(eq(exams.academicYearId, id));
  await db.delete(schedules).where(eq(schedules.academicYearId, id));
  await db.delete(enrollments).where(eq(enrollments.academicYearId, id));
  await db.update(expenses).set({ academicYearId: null as unknown as number | null }).where(eq(expenses.academicYearId, id));
  await db.delete(academicYears).where(eq(academicYears.id, id));
}

export async function deleteAcademicYear(id: number) {
  await db.delete(academicYears).where(eq(academicYears.id, id));
}
