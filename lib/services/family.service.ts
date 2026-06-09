import { findFamilyByStudentId, upsertFamily } from "@/lib/repositories/family.repository";
import { logAudit } from "@/lib/services/audit.service";

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
}>, userId?: number) {
  const { id: _, studentId: __, ...clean } = input as any;
  const row = await upsertFamily(Number(studentId), clean);
  logAudit({ tableName: "family_infos", recordId: row.id, action: "create", userId, newValues: input as any });
  return { id: String(row.id), studentId: String(row.studentId) };
}
