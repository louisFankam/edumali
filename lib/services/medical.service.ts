import { findMedicalByStudentId, upsertMedical } from "@/lib/repositories/medical.repository";
import { logAudit } from "@/lib/services/audit.service";

export async function getMedicalInfo(studentId: string) {
  const row = await findMedicalByStudentId(Number(studentId));
  if (!row) return null;
  return {
    id: String(row.id),
    studentId: String(row.studentId),
    bloodType: row.bloodType || "",
    allergies: row.allergies || "",
    medicalConditions: row.medicalConditions || "",
    medications: row.medications || "",
    doctorName: row.doctorName || "",
    doctorPhone: row.doctorPhone || "",
    emergencyContact: row.emergencyContact || "",
    emergencyPhone: row.emergencyPhone || "",
    vaccinationStatus: row.vaccinationStatus || "",
  };
}

export async function saveMedicalInfo(studentId: string, input: Partial<{
  bloodType: string; allergies: string; medicalConditions: string; medications: string;
  doctorName: string; doctorPhone: string; emergencyContact: string; emergencyPhone: string; vaccinationStatus: string;
}>, userId?: number) {
  const { id: _, studentId: __, ...clean } = input as any;
  const row = await upsertMedical(Number(studentId), clean);
  logAudit({ tableName: "medical_infos", recordId: row.id, action: "create", userId, newValues: input as any });
  return { id: String(row.id), studentId: String(row.studentId) };
}
