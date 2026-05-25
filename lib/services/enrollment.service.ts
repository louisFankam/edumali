import {
  findAllEnrollments, findEnrollmentById, createEnrollment, updateEnrollment, deleteEnrollment, countEnrollmentsByYear,
} from "@/lib/repositories/enrollment.repository";

function mapEnrollment(e: any) {
  if (!e) return null;
  return {
    id: String(e.id), studentId: String(e.studentId), classId: String(e.classId),
    academicYearId: String(e.academicYearId), enrollmentDate: e.enrollmentDate, status: e.status, notes: e.notes,
    studentName: e.student ? `${e.student.firstName} ${e.student.lastName}` : undefined,
    className: e.class?.name,
    academicYearName: e.academicYear?.name,
  };
}

export async function getEnrollments(filters?: { studentId?: string; academicYearId?: string }) {
  const rows = await findAllEnrollments({
    studentId: filters?.studentId ? Number(filters.studentId) : undefined,
    academicYearId: filters?.academicYearId ? Number(filters.academicYearId) : undefined,
  });
  return rows.map(mapEnrollment);
}

export async function getEnrollmentById(id: string) {
  const row = await findEnrollmentById(Number(id));
  return mapEnrollment(row);
}

export async function addEnrollment(input: {
  studentId: number; classId: number; academicYearId: number;
  enrollmentDate: string; status: string; notes?: string;
}) {
  const created = await createEnrollment(input);
  return mapEnrollment(created);
}

export async function editEnrollment(id: string, input: Partial<{ classId: number; status: string; notes: string }>) {
  const updated = await updateEnrollment(Number(id), input);
  return mapEnrollment(updated);
}

export async function removeEnrollment(id: string) {
  await deleteEnrollment(Number(id));
}

export async function getEnrollmentStats(academicYearId?: string) {
  return countEnrollmentsByYear(academicYearId ? Number(academicYearId) : undefined);
}
