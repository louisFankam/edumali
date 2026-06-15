import {
  findSubjectsByClassId, bulkAssignSubjects, removeSubjectFromClass,
  updateClassSubjectTeacher, updateTeacherForSubjectInClass,
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
    teacherId: r.teacherId ? String(r.teacherId) : null,
    teacherName: r.teacherName || null,
  }));
}

export async function saveClassSubjects(classId: string, assignments: { subjectId: number; coefficient: number; teacherId?: number | null }[], userId?: number) {
  await bulkAssignSubjects(Number(classId), assignments);
  logAudit({ tableName: "class_subjects", recordId: 0, action: "create", userId, newValues: { batch: true, count: assignments.length, classId } });
  return { ok: true };
}

export async function removeSubject(classId: string, subjectId: string, userId?: number) {
  logAudit({ tableName: "class_subjects", recordId: Number(subjectId), action: "delete", userId, newValues: { classId, subjectId } });
  await removeSubjectFromClass(Number(classId), Number(subjectId));
}

export async function setSubjectTeacher(classSubjectId: string, teacherId: string | null, userId?: number) {
  const result = await updateClassSubjectTeacher(Number(classSubjectId), teacherId ? Number(teacherId) : null);
  logAudit({ tableName: "class_subjects", recordId: Number(classSubjectId), action: "update", userId, newValues: { teacherId } });
  return result;
}

export async function setSubjectTeacherInClass(classId: string, subjectId: string, teacherId: string | null, userId?: number) {
  const result = await updateTeacherForSubjectInClass(Number(classId), Number(subjectId), teacherId ? Number(teacherId) : null);
  logAudit({ tableName: "class_subjects", recordId: 0, action: "update", userId, newValues: { classId, subjectId, teacherId } });
  return result;
}
