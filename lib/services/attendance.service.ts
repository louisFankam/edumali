import {
  findAttendanceByDateAndClass,
  upsertAttendance,
  findAttendanceStats,
  updateAttendance,
  deleteAttendance,
  findAttendanceByStudent,
} from "@/lib/repositories/attendance.repository";
import type { attendance } from "@/lib/models/schema";

function mapRecord(r: any) {
  if (!r) return null;
  return {
    id: String(r.id),
    studentId: String(r.studentId),
    classId: String(r.classId),
    date: r.date,
    status: r.status,
    justification: r.justification,
    studentName: r.student ? `${r.student.firstName} ${r.student.lastName}` : undefined,
    className: r.class?.name,
  };
}

export async function getAttendanceByDateAndClass(date: string, classId?: string) {
  const rows = await findAttendanceByDateAndClass(date, classId ? Number(classId) : undefined);
  return rows.map(mapRecord);
}

export async function saveAttendance(records: { studentId: number; classId: number; date: string; status: string; justification?: string }[]) {
  await upsertAttendance(records);
}

export async function getAttendanceStats(studentId?: string, classId?: string, from?: string, to?: string) {
  return findAttendanceStats(studentId ? Number(studentId) : undefined, classId ? Number(classId) : undefined, from, to);
}

export async function editAttendance(id: string, input: { status?: string; justification?: string }) {
  const updated = await updateAttendance(Number(id), input);
  return mapRecord(updated);
}

export async function removeAttendance(id: string) {
  await deleteAttendance(Number(id));
}

export async function getStudentAttendance(studentId: string) {
  const rows = await findAttendanceByStudent(Number(studentId));
  return rows.map(r => ({
    id: String(r.id),
    date: r.date,
    status: r.status,
    justification: r.justification,
  }));
}
