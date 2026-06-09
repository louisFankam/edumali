import { sql } from "drizzle-orm"

/**
 * Seed helpers for integration tests.
 * Each function creates a minimal record via raw SQL (avoiding service-layer
 * guards) and returns its ID as a string, matching the pattern used by
 * service-layer return values.
 *
 * Overrides allow customising any field.  All functions insert directly into
 * the table so there is no interference from guard logic.
 */

let n = 0
function uniq(prefix: string): string {
  n++
  return `${prefix}-${n}-${Date.now()}`
}

export async function seedClass(overrides: Record<string, any> = {}) {
  const { db } = await import("@/lib/db")
  const name = overrides.name ?? uniq("Classe")
  const level = overrides.level ?? null
  const capacity = overrides.capacity ?? 0
  const totalFee = overrides.totalFee ?? 0
  const teacherId = overrides.teacherId ?? null
  const color = overrides.color ?? "#6366f1"
  const academicYear = overrides.academicYear ?? ""
  const status = overrides.status ?? "active"

  const rows = db.all(sql`
    INSERT INTO classes (name, level, capacity, total_fee, teacher_id, color, academic_year, status, created_at, updated_at)
    VALUES (${name}, ${level}, ${capacity}, ${totalFee}, ${teacherId}, ${color}, ${academicYear}, ${status}, unixepoch('now'), unixepoch('now'))
    RETURNING id
  `) as { id: number }[]
  return String(rows[0].id)
}

export async function seedStudent(classId: string, overrides: Record<string, any> = {}) {
  const { db } = await import("@/lib/db")
  const firstName = overrides.firstName ?? uniq("Prénom")
  const lastName = overrides.lastName ?? uniq("Nom")
  const gender = overrides.gender ?? "Masculin"
  const birthDate = overrides.birthDate ?? "2010-01-01"
  const nationality = overrides.nationality ?? "Malienne"
  const photo = overrides.photo ?? null
  const parentName = overrides.parentName ?? "Parent Test"
  const parentPhone = overrides.parentPhone ?? "70000000"
  const address = overrides.address ?? "Bamako"
  const registrationDate = overrides.registrationDate ?? "2024-09-01"
  const status = overrides.status ?? "Actif"
  const discountType = overrides.discountType ?? null
  const discountValue = overrides.discountValue ?? null
  const discountReason = overrides.discountReason ?? null

  const rows = db.all(sql`
    INSERT INTO students (first_name, last_name, gender, birth_date, nationality, photo, parent_name, parent_phone, address, class_id, registration_date, status, discount_type, discount_value, discount_reason, created_at, updated_at)
    VALUES (${firstName}, ${lastName}, ${gender}, ${birthDate}, ${nationality}, ${photo}, ${parentName}, ${parentPhone}, ${address}, ${Number(classId)}, ${registrationDate}, ${status}, ${discountType}, ${discountValue}, ${discountReason}, unixepoch('now'), unixepoch('now'))
    RETURNING id
  `) as { id: number }[]
  return String(rows[0].id)
}

export async function seedSubject(overrides: Record<string, any> = {}) {
  const { db } = await import("@/lib/db")
  const name = overrides.name ?? uniq("Matière")
  const code = overrides.code ?? ""
  const coefficient = overrides.coefficient ?? 1
  const hoursPerWeek = overrides.hoursPerWeek ?? 0
  const description = overrides.description ?? ""
  const color = overrides.color ?? "#6366f1"
  const status = overrides.status ?? "Actif"

  const rows = db.all(sql`
    INSERT INTO subjects (name, code, coefficient, hours_per_week, description, color, status, created_at, updated_at)
    VALUES (${name}, ${code}, ${coefficient}, ${hoursPerWeek}, ${description}, ${color}, ${status}, unixepoch('now'), unixepoch('now'))
    RETURNING id
  `) as { id: number }[]
  return String(rows[0].id)
}

export async function seedTeacher(overrides: Record<string, any> = {}) {
  const { db } = await import("@/lib/db")
  const firstName = overrides.firstName ?? uniq("TeacherFn")
  const lastName = overrides.lastName ?? uniq("TeacherLn")
  const email = overrides.email ?? `${uniq("t")}@test.ml`
  const phone = overrides.phone ?? "70000001"
  const address = overrides.address ?? "Bamako"
  const gender = overrides.gender ?? "Masculin"
  const hireDate = overrides.hireDate ?? "2020-09-01"
  const salary = overrides.salary ?? 150000
  const hoursPerDay = overrides.hoursPerDay ?? 4
  const contrat = overrides.contrat ?? "mensuel"
  const status = overrides.status ?? "active"
  const photo = overrides.photo ?? null
  const userId = overrides.userId ?? null

  const rows = db.all(sql`
    INSERT INTO teachers (first_name, last_name, email, phone, address, gender, hire_date, salary, hours_per_day, contrat, status, photo, user_id, created_at, updated_at)
    VALUES (${firstName}, ${lastName}, ${email}, ${phone}, ${address}, ${gender}, ${hireDate}, ${salary}, ${hoursPerDay}, ${contrat}, ${status}, ${photo}, ${userId}, unixepoch('now'), unixepoch('now'))
    RETURNING id
  `) as { id: number }[]
  return String(rows[0].id)
}

export async function seedAcademicYear(overrides: Record<string, any> = {}) {
  const { db } = await import("@/lib/db")
  const name = overrides.name ?? "2024-2025"
  const startDate = overrides.startDate ?? "2024-09-01"
  const endDate = overrides.endDate ?? "2025-08-31"
  const isCurrent = overrides.isCurrent ?? true

  const rows = db.all(sql`
    INSERT INTO academic_years (name, start_date, end_date, is_current, created_at, updated_at)
    VALUES (${name}, ${startDate}, ${endDate}, ${isCurrent ? 1 : 0}, unixepoch('now'), unixepoch('now'))
    RETURNING id
  `) as { id: number }[]
  return String(rows[0].id)
}

export async function seedEnrollment(studentId: string, classId: string, academicYearId: string, overrides: Record<string, any> = {}) {
  const { db } = await import("@/lib/db")
  const enrollmentDate = overrides.enrollmentDate ?? "2024-09-01"
  const status = overrides.status ?? "inscrit"
  const notes = overrides.notes ?? null

  const rows = db.all(sql`
    INSERT INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status, notes, created_at, updated_at)
    VALUES (${Number(studentId)}, ${Number(classId)}, ${Number(academicYearId)}, ${enrollmentDate}, ${status}, ${notes}, unixepoch('now'), unixepoch('now'))
    RETURNING id
  `) as { id: number }[]
  return String(rows[0].id)
}

export async function seedTeacherSubject(teacherId: string, subjectId: string) {
  const { db } = await import("@/lib/db")
  db.run(sql`
    INSERT INTO teacher_subjects (teacher_id, subject_id)
    VALUES (${Number(teacherId)}, ${Number(subjectId)})
  `)
}

export async function seedSchoolEvent(overrides: Record<string, any> = {}) {
  const { db } = await import("@/lib/db")
  const title = overrides.title ?? uniq("Événement")
  const description = overrides.description ?? null
  const type = overrides.type ?? "event"
  const startDate = overrides.startDate ?? "2026-06-15"
  const endDate = overrides.endDate ?? null
  const startTime = overrides.startTime ?? null
  const endTime = overrides.endTime ?? null
  const allDay = overrides.allDay ?? 1
  const color = overrides.color ?? null

  const rows = db.all(sql`
    INSERT INTO school_events (title, description, type, start_date, end_date, start_time, end_time, all_day, color, created_at, updated_at)
    VALUES (${title}, ${description}, ${type}, ${startDate}, ${endDate}, ${startTime}, ${endTime}, ${allDay}, ${color}, unixepoch('now'), unixepoch('now'))
    RETURNING id
  `) as { id: number }[]
  return String(rows[0].id)
}
