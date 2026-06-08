import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { subjects, teacherSubjects, teachers } from "@/lib/models/schema";

export async function findAllSubjects() {
  return db.all(sql`
    SELECT s.*, COUNT(ts.id) AS teacher_number
    FROM subjects s
    LEFT JOIN teacher_subjects ts ON ts.subject_id = s.id
    GROUP BY s.id
    ORDER BY s.name ASC
  `) as any[];
}

export async function findSubjectById(id: number) {
  return db.query.subjects.findFirst({ where: eq(subjects.id, id) });
}

export async function findSubjectByIdWithTeachers(id: number) {
  const rows = db.all(sql`
    SELECT s.*, t.id AS teacher_id, t.first_name AS teacher_first_name, t.last_name AS teacher_last_name
    FROM subjects s
    LEFT JOIN teacher_subjects ts ON ts.subject_id = s.id
    LEFT JOIN teachers t ON t.id = ts.teacher_id
    WHERE s.id = ${id}
  `) as any[];
  if (rows.length === 0) return null;
  const teachersList = rows
    .filter((r: any) => r.teacher_id !== null)
    .map((r: any) => ({
      id: String(r.teacher_id),
      firstName: r.teacher_first_name,
      lastName: r.teacher_last_name,
      fullName: `${r.teacher_first_name} ${r.teacher_last_name}`,
    }));
  return {
    id: String(rows[0].id),
    name: rows[0].name,
    code: rows[0].code ?? "",
    coefficient: rows[0].coefficient ?? 1,
    hoursPerWeek: rows[0].hours_per_week ?? 0,
    description: rows[0].description ?? "",
    color: rows[0].color ?? "#6366f1",
    status: rows[0].status,
    teachers: teachersList,
    teacherNumber: teachersList.length,
  };
}

export async function setSubjectTeachers(subjectId: number, teacherIds: number[]) {
  await db.delete(teacherSubjects).where(eq(teacherSubjects.subjectId, subjectId));
  if (teacherIds.length > 0) {
    await db.insert(teacherSubjects).values(
      teacherIds.map(tid => ({ teacherId: tid, subjectId }))
    );
  }
}

export async function createSubject(input: {
  name: string;
  code?: string;
  coefficient?: number;
  hoursPerWeek?: number;
  description?: string;
  color?: string;
  status?: string;
}) {
  const [created] = await db.insert(subjects).values(input as any).returning();
  return created;
}

export async function updateSubject(id: number, input: {
  name?: string;
  code?: string;
  coefficient?: number;
  hoursPerWeek?: number;
  description?: string;
  color?: string;
  status?: string;
}) {
  const [updated] = await db
    .update(subjects)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(subjects.id, id))
    .returning();
  return updated;
}

export async function deleteSubject(id: number) {
  await db.delete(subjects).where(eq(subjects.id, id));
}
