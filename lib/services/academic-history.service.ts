import {
  findHistoriesByStudentId, createHistory, updateHistory, deleteHistory,
} from "@/lib/repositories/academic-history.repository";
import { logAudit } from "@/lib/services/audit.service";

function mapHistory(h: any) {
  return {
    id: String(h.id),
    studentId: String(h.studentId),
    schoolName: h.schoolName,
    className: h.className || "",
    academicYear: h.academicYear || "",
    reason: h.reason || "",
    remarks: h.remarks || "",
  };
}

export async function getAcademicHistories(studentId: string) {
  const rows = await findHistoriesByStudentId(Number(studentId));
  return rows.map(mapHistory);
}

export async function addAcademicHistory(studentId: string, input: {
  schoolName: string; className?: string; academicYear?: string; reason?: string; remarks?: string;
}, userId?: number) {
  const created = await createHistory(Number(studentId), input);
  logAudit({ tableName: "academic_histories", recordId: created.id, action: "create", userId, newValues: { ...input, studentId } as any });
  return mapHistory(created);
}

export async function editAcademicHistory(id: string, input: Partial<{
  schoolName: string; className: string; academicYear: string; reason: string; remarks: string;
}>, userId?: number) {
  const updated = await updateHistory(Number(id), input);
  logAudit({ tableName: "academic_histories", recordId: Number(id), action: "update", userId, newValues: input as any });
  return mapHistory(updated);
}

export async function removeAcademicHistory(id: string, userId?: number) {
  logAudit({ tableName: "academic_histories", recordId: Number(id), action: "delete", userId });
  await deleteHistory(Number(id));
}
