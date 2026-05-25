import {
  findHistoriesByStudentId, createHistory, updateHistory, deleteHistory,
} from "@/lib/repositories/academic-history.repository";

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
}) {
  const created = await createHistory(Number(studentId), input);
  return mapHistory(created);
}

export async function editAcademicHistory(id: string, input: Partial<{
  schoolName: string; className: string; academicYear: string; reason: string; remarks: string;
}>) {
  const updated = await updateHistory(Number(id), input);
  return mapHistory(updated);
}

export async function removeAcademicHistory(id: string) {
  await deleteHistory(Number(id));
}
