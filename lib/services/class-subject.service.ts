import {
  findSubjectsByClassId, bulkAssignSubjects, removeSubjectFromClass,
} from "@/lib/repositories/class-subject.repository";

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

export async function saveClassSubjects(classId: string, assignments: { subjectId: number; coefficient: number }[]) {
  await bulkAssignSubjects(Number(classId), assignments);
  return { ok: true };
}

export async function removeSubject(classId: string, subjectId: string) {
  await removeSubjectFromClass(Number(classId), Number(subjectId));
}
