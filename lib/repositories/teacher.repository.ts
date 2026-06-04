import { eq, like, or, and, sql, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { teachers, teacherSubjects, teacherAttendance, payroll } from "@/lib/models/schema";

export type TeacherRow = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;

export async function findAllTeachers(filters?: {
  search?: string; status?: string; contrat?: string; page?: number; limit?: number;
}) {
  const conditions = [];
  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(like(teachers.firstName, term), like(teachers.lastName, term), like(teachers.email, term))!
    );
  }
  if (filters?.status) {
    conditions.push(eq(teachers.status, filters.status as any));
  }
  if (filters?.contrat) {
    conditions.push(eq(teachers.contrat, filters.contrat as any));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  if (filters?.page && filters?.limit) {
    const offset = (filters.page - 1) * filters.limit;
    return db.query.teachers.findMany({
      where,
      with: { subjects: { with: { subject: true } } },
      orderBy: (t, { asc }) => [asc(t.lastName), asc(t.firstName)],
      limit: filters.limit,
      offset,
    });
  }
  return db.query.teachers.findMany({
    where,
    with: { subjects: { with: { subject: true } } },
    orderBy: (t, { asc }) => [asc(t.lastName), asc(t.firstName)],
  });
}

export async function findTeacherById(id: number) {
  return db.query.teachers.findFirst({
    where: eq(teachers.id, id),
    with: { subjects: { with: { subject: true } } },
  });
}

export async function createTeacher(input: NewTeacher) {
  const [created] = await db.insert(teachers).values(input).returning();
  return db.query.teachers.findFirst({
    where: eq(teachers.id, created.id),
    with: { subjects: { with: { subject: true } } },
  });
}

export async function updateTeacher(id: number, input: Partial<NewTeacher>) {
  await db.update(teachers).set({ ...input, updatedAt: new Date() }).where(eq(teachers.id, id));
  return db.query.teachers.findFirst({
    where: eq(teachers.id, id),
    with: { subjects: { with: { subject: true } } },
  });
}

export async function deleteTeacher(id: number) {
  await db.delete(teacherSubjects).where(eq(teacherSubjects.teacherId, id));
  await db.delete(teacherAttendance).where(eq(teacherAttendance.teacherId, id));
  await db.delete(payroll).where(eq(payroll.teacherId, id));
  await db.delete(teachers).where(eq(teachers.id, id));
}

export async function countTeachers(filters?: { search?: string; status?: string; contrat?: string }) {
  const conditions = [];
  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(like(teachers.firstName, term), like(teachers.lastName, term), like(teachers.email, term))!
    );
  }
  if (filters?.status) conditions.push(eq(teachers.status, filters.status as any));
  if (filters?.contrat) conditions.push(eq(teachers.contrat, filters.contrat as any));
  const rows = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  return rows.length;
}

export async function setTeacherSubjects(teacherId: number, subjectIds: number[]) {
  await db.delete(teacherSubjects).where(eq(teacherSubjects.teacherId, teacherId));
  if (subjectIds.length > 0) {
    await db.insert(teacherSubjects).values(
      subjectIds.map(subjectId => ({ teacherId, subjectId }))
    );
  }
}

export async function findTeacherAttendance(teacherId?: number, from?: string, to?: string) {
  const conditions = [];
  if (teacherId) conditions.push(eq(teacherAttendance.teacherId, teacherId));
  if (from) conditions.push(gte(teacherAttendance.date, from));
  if (to) conditions.push(lte(teacherAttendance.date, to));
  return db.query.teacherAttendance.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { teacher: true },
    orderBy: (a, { desc }) => [desc(a.date)],
  });
}

export async function findTeacherAttendanceByDate(date: string) {
  return db.query.teacherAttendance.findMany({
    where: eq(teacherAttendance.date, date),
    with: { teacher: true },
  });
}

export async function upsertTeacherAttendance(records: { teacherId: number; date: string; status: string; justification?: string }[]) {
  return db
    .insert(teacherAttendance)
    .values(records.map(r => ({ teacherId: r.teacherId, date: r.date, status: r.status as any, justification: r.justification })))
    .onConflictDoUpdate({
      target: [teacherAttendance.teacherId, teacherAttendance.date],
      set: { status: sql`excluded.status`, justification: sql`excluded.justification`, updatedAt: new Date() },
    });
}

export async function findAllPayroll(filters?: { teacherId?: number; month?: number; year?: number }) {
  const conditions = [];
  if (filters?.teacherId) conditions.push(eq(payroll.teacherId, filters.teacherId));
  if (filters?.month) conditions.push(eq(payroll.month, filters.month));
  if (filters?.year) conditions.push(eq(payroll.year, filters.year));
  return db.query.payroll.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { teacher: true },
    orderBy: (p, { desc }) => [desc(p.year), desc(p.month)],
  });
}

export async function createPayroll(input: {
  teacherId: number; month: number; year: number;
  amount: number; bonus?: number; deductions?: number; paidAt?: string; notes?: string;
}) {
  const [created] = await db.insert(payroll).values(input).returning();
  return created;
}

export async function updatePayrollRecord(id: number, data: Partial<typeof payroll.$inferInsert>) {
  await db.update(payroll).set(data).where(eq(payroll.id, id));
}

export async function deletePayrollRecord(id: number) {
  await db.delete(payroll).where(eq(payroll.id, id));
}
