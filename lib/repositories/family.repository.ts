import { db } from "@/lib/db";
import { familyInfos } from "@/lib/models/schema";
import { eq } from "drizzle-orm";

export async function findFamilyByStudentId(studentId: number) {
  const rows = await db.select().from(familyInfos).where(eq(familyInfos.studentId, studentId)).limit(1);
  return rows[0] || null;
}

export async function upsertFamily(studentId: number, input: Partial<{
  fatherName: string; fatherPhone: string; fatherProfession: string;
  motherName: string; motherPhone: string; motherProfession: string;
  guardianName: string; guardianRelation: string; guardianPhone: string;
}>) {
  const existing = await findFamilyByStudentId(studentId);
  if (existing) {
    const [updated] = await db.update(familyInfos).set({ ...input, updatedAt: new Date() }).where(eq(familyInfos.id, existing.id)).returning();
    return updated;
  }
  const [created] = await db.insert(familyInfos).values({ studentId, ...input }).returning();
  return created;
}
