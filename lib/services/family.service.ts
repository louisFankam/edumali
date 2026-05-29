import { findFamilyByStudentId, upsertFamily } from "@/lib/repositories/family.repository";

export async function getFamilyInfo(studentId: string) {
  const row = await findFamilyByStudentId(Number(studentId));
  if (!row) return null;
  return {
    id: String(row.id),
    studentId: String(row.studentId),
    fatherName: row.fatherName || "",
    fatherPhone: row.fatherPhone || "",
    fatherProfession: row.fatherProfession || "",
    motherName: row.motherName || "",
    motherPhone: row.motherPhone || "",
    motherProfession: row.motherProfession || "",
    guardianName: row.guardianName || "",
    guardianRelation: row.guardianRelation || "",
    guardianPhone: row.guardianPhone || "",
  };
}

export async function saveFamilyInfo(studentId: string, input: Partial<{
  fatherName: string; fatherPhone: string; fatherProfession: string;
  motherName: string; motherPhone: string; motherProfession: string;
  guardianName: string; guardianRelation: string; guardianPhone: string;
}>) {
  const { id: _, studentId: __, ...clean } = input as any;
  const row = await upsertFamily(Number(studentId), clean);
  return { id: String(row.id), studentId: String(row.studentId) };
}
