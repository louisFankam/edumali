import {
  findSubjectsByClassId, bulkAssignSubjects, removeSubjectFromClass,
} from "@/lib/repositories/class-subject.repository";
import { logAudit } from "@/lib/services/audit.service";

export async function getClassSubjects(classId: string) {
  const rows = await findSubjectsByClassId(Number(classId));
  return rows.map(r => ({
    id: String(r.id),
    classId: String(r.classId),
    subjectId: String(r.subjectId),
    coefficient: r.coefficient,
    subjectName: r.subjectName,
    subjectCode: r.subjectCode || "",
    teacherNames: r.teacherNames || "",
  }));
}

export async function saveClassSubjects(classId: string, assignments: { subjectId: number; coefficient: number }[], userId?: number) {
  await bulkAssignSubjects(Number(classId), assignments);
  logAudit({ tableName: "class_subjects", recordId: 0, action: "create", userId, newValues: { batch: true, count: assignments.length, classId } });
  return { ok: true };
}

export async function removeSubject(classId: string, subjectId: string, userId?: number) {
  logAudit({ tableName: "class_subjects", recordId: Number(subjectId), action: "delete", userId, newValues: { classId, subjectId } });
  await removeSubjectFromClass(Number(classId), Number(subjectId));
}
