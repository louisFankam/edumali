import { eq, like, or, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { students, classes } from "@/lib/models/schema";

export type StudentRow = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

export async function findAllStudents(filters?: { search?: string; classId?: number; page?: number; limit?: number }) {
  const conditions = [];
  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(like(students.firstName, term), like(students.lastName, term), like(students.parentName, term))!
    );
  }
  if (filters?.classId) {
    conditions.push(eq(students.classId, filters.classId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let result;
  if (filters?.page && filters?.limit) {
    const offset = (filters.page - 1) * filters.limit;
    result = db.query.students.findMany({
      where,
      with: { class: true },
      orderBy: (s, { asc }) => [asc(s.lastName), asc(s.firstName)],
      limit: filters.limit,
      offset,
    });
  } else {
    result = db.query.students.findMany({
      where,
      with: { class: true },
      orderBy: (s, { asc }) => [asc(s.lastName), asc(s.firstName)],
    });
  }
  return result;
}

export async function findStudentById(id: number) {
  return db.query.students.findFirst({
    where: eq(students.id, id),
    with: { class: true },
  });
}

export async function createStudent(input: NewStudent) {
  const [created] = await db.insert(students).values(input).returning();
  return db.query.students.findFirst({
    where: eq(students.id, created.id),
    with: { class: true },
  });
}

export async function updateStudent(id: number, input: Partial<NewStudent>) {
  await db.update(students).set({ ...input, updatedAt: new Date() }).where(eq(students.id, id));
  return db.query.students.findFirst({
    where: eq(students.id, id),
    with: { class: true },
  });
}

export async function deleteStudent(id: number) {
  await db.delete(students).where(eq(students.id, id));
}

export async function countStudents(filters?: { classId?: number; status?: string; search?: string }) {
  const conditions = [];
  if (filters?.classId) conditions.push(eq(students.classId, filters.classId));
  if (filters?.status) conditions.push(eq(students.status, filters.status));
  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(like(students.firstName, term), like(students.lastName, term), like(students.parentName, term))!
    );
  }
  const rows = await db
    .select({ id: students.id })
    .from(students)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  return rows.length;
}
