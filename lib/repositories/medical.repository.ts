import { db } from "@/lib/db";
import { medicalInfos } from "@/lib/models/schema";
import { eq } from "drizzle-orm";

export async function findMedicalByStudentId(studentId: number) {
  const rows = await db.select().from(medicalInfos).where(eq(medicalInfos.studentId, studentId)).limit(1);
  return rows[0] || null;
}

export async function upsertMedical(studentId: number, input: Partial<{
  bloodType: string; allergies: string; medicalConditions: string; medications: string;
  doctorName: string; doctorPhone: string; emergencyContact: string; emergencyPhone: string; vaccinationStatus: string;
}>) {
  const existing = await findMedicalByStudentId(studentId);
  if (existing) {
    const [updated] = await db.update(medicalInfos).set({ ...input, updatedAt: new Date() }).where(eq(medicalInfos.id, existing.id)).returning();
    return updated;
  }
  const [created] = await db.insert(medicalInfos).values({ studentId, ...input }).returning();
  return created;
}
