import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attendance, students, classes } from "@/lib/models/schema";

export async function findAttendanceByDateAndClass(date: string, classId?: number) {
  const conditions = [eq(attendance.date, date)];
  if (classId) conditions.push(eq(attendance.classId, classId));
  return db.query.attendance.findMany({
    where: and(...conditions),
    with: { student: true, class: true },
    orderBy: (a, { asc }) => [asc(a.studentId)],
  });
}

export async function upsertAttendance(records: { studentId: number; classId: number; date: string; status: string; justification?: string }[]) {
  const stmt = db.insert(attendance).values(records).onConflictDoUpdate({
    target: [attendance.studentId, attendance.date],
    set: { status: sql`excluded.status`, justification: sql`excluded.justification`, updatedAt: new Date() },
  });
  return stmt;
}

export async function findAttendanceStats(studentId?: number, classId?: number, from?: string, to?: string) {
  const conditions: any[] = [];
  if (studentId) conditions.push(eq(attendance.studentId, studentId));
  if (classId) conditions.push(eq(attendance.classId, classId));
  if (from) conditions.push(gte(attendance.date, from));
  if (to) conditions.push(lte(attendance.date, to));

  const rows = await db.select({
    status: attendance.status,
    count: sql<number>`count(*)`.as("count"),
  }).from(attendance).where(and(...conditions)).groupBy(attendance.status);

  const total = rows.reduce((s, r) => s + r.count, 0);
  const stats: Record<string, number> = { présent: 0, absent: 0, retard: 0, congé: 0 };
  rows.forEach(r => { stats[r.status] = r.count; });
  return { total, ...stats, rate: total > 0 ? Math.round(((stats["présent"] + stats["congé"]) / total) * 100) : 0 };
}

export async function updateAttendance(id: number, input: { status?: string; justification?: string }) {
  const [updated] = await db.update(attendance).set({ ...input, updatedAt: new Date() }).where(eq(attendance.id, id)).returning();
  return updated;
}

export async function deleteAttendance(id: number) {
  await db.delete(attendance).where(eq(attendance.id, id));
}

export async function findAttendanceByStudent(studentId: number, limit = 50) {
  return db.query.attendance.findMany({
    where: eq(attendance.studentId, studentId),
    orderBy: (a, { desc }) => [desc(a.date)],
    limit,
  });
}
