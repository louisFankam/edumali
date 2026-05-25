import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { enrollments } from "@/lib/models/schema";

export async function findAllEnrollments(filters?: { studentId?: number; academicYearId?: number }) {
  const conditions: any[] = [];
  if (filters?.studentId) conditions.push(eq(enrollments.studentId, filters.studentId));
  if (filters?.academicYearId) conditions.push(eq(enrollments.academicYearId, filters.academicYearId));

  return db.query.enrollments.findMany({
    where: and(...conditions),
    with: { student: true, class: true, academicYear: true },
    orderBy: (e, { desc }) => [desc(e.enrollmentDate)],
  });
}

export async function findEnrollmentById(id: number) {
  return db.query.enrollments.findFirst({ where: eq(enrollments.id, id), with: { student: true, class: true, academicYear: true } });
}

export async function createEnrollment(input: {
  studentId: number; classId: number; academicYearId: number;
  enrollmentDate: string; status: string; notes?: string;
}) {
  const [created] = await db.insert(enrollments).values(input).returning();
  return created;
}

export async function updateEnrollment(id: number, input: Partial<{ classId: number; status: string; notes: string }>) {
  const [updated] = await db.update(enrollments).set({ ...input, updatedAt: new Date() }).where(eq(enrollments.id, id)).returning();
  return updated;
}

export async function deleteEnrollment(id: number) {
  await db.delete(enrollments).where(eq(enrollments.id, id));
}

export async function countEnrollmentsByYear(academicYearId?: number) {
  const conditions: any[] = [];
  if (academicYearId) conditions.push(eq(enrollments.academicYearId, academicYearId));

  const rows = await db.select({
    status: enrollments.status,
    count: sql<number>`count(*)`.as("count"),
  }).from(enrollments).where(and(...conditions)).groupBy(enrollments.status);

  const total = rows.reduce((s, r) => s + Number(r.count), 0);
  const stats: Record<string, number> = {};
  rows.forEach(r => { stats[r.status] = Number(r.count); });
  return { total, ...stats };
}
