import {
  findAttendanceByDateAndClass,
  upsertAttendance,
  findAttendanceStats,
  updateAttendance,
  deleteAttendance,
  findAttendanceByStudent,
  findAttendanceByRange,
} from "@/lib/repositories/attendance.repository";
import { logAudit } from "@/lib/services/audit.service";
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

export async function saveAttendance(records: { studentId: number; classId: number; date: string; status: string; justification?: string }[], userId?: number) {
  await upsertAttendance(records);
  const firstDate = records[0]?.date;
  logAudit({ tableName: "attendance", recordId: 0, action: "create", userId, newValues: { batch: true, count: records.length, date: firstDate } });
}

export async function getAttendanceStats(studentId?: string, classId?: string, from?: string, to?: string) {
  return findAttendanceStats(studentId ? Number(studentId) : undefined, classId ? Number(classId) : undefined, from, to);
}

export async function editAttendance(id: string, input: { status?: string; justification?: string }, userId?: number) {
  const updated = await updateAttendance(Number(id), input);
  logAudit({ tableName: "attendance", recordId: Number(id), action: "update", userId, newValues: input as any });
  return mapRecord(updated);
}

export async function removeAttendance(id: string, userId?: number) {
  logAudit({ tableName: "attendance", recordId: Number(id), action: "delete", userId });
  await deleteAttendance(Number(id));
}

export async function getAttendanceByRange(from: string, to: string, classId?: string) {
  const rows = await findAttendanceByRange(from, to, classId ? Number(classId) : undefined);
  return rows.map(mapRecord);
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
