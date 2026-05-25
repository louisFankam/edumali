import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { academicYears } from "@/lib/models/schema";

export async function findAllAcademicYears() {
  return db.query.academicYears.findMany({ orderBy: (y, { desc }) => [desc(y.startDate)] });
}

export async function findAcademicYearById(id: number) {
  return db.query.academicYears.findFirst({ where: eq(academicYears.id, id) });
}

export async function findCurrentAcademicYear() {
  return db.query.academicYears.findFirst({ where: eq(academicYears.isCurrent, true) });
}

export async function createAcademicYear(input: {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}) {
  if (input.isCurrent) {
    await db.update(academicYears).set({ isCurrent: false });
  }
  const [created] = await db.insert(academicYears).values(input as any).returning();
  return created;
}

export async function updateAcademicYear(id: number, input: {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}) {
  if (input.isCurrent) {
    await db.update(academicYears).set({ isCurrent: false });
  }
  const [updated] = await db
    .update(academicYears)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(academicYears.id, id))
    .returning();
  return updated;
}

export async function deleteAcademicYear(id: number) {
  await db.delete(academicYears).where(eq(academicYears.id, id));
}
