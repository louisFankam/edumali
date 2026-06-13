import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { classFeeTypes } from "@/lib/models/schema";

export async function findClassFeeTypes(classId: number) {
  return db.query.classFeeTypes.findMany({
    where: eq(classFeeTypes.classId, classId),
    with: { feeType: true },
  });
}

export async function findAllClassFeeTypes() {
  return db.query.classFeeTypes.findMany({
    with: { feeType: true },
  });
}

export async function findClassFeeType(classId: number, feeTypeId: number) {
  return db.query.classFeeTypes.findFirst({
    where: and(eq(classFeeTypes.classId, classId), eq(classFeeTypes.feeTypeId, feeTypeId)),
    with: { feeType: true },
  });
}

export async function upsertClassFeeType(classId: number, feeTypeId: number, amount: number | null) {
  const existing = await findClassFeeType(classId, feeTypeId);
  if (existing) {
    const [updated] = await db.update(classFeeTypes)
      .set({ amount, updatedAt: new Date() })
      .where(eq(classFeeTypes.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db.insert(classFeeTypes)
    .values({ classId, feeTypeId, amount })
    .returning();
  return created;
}

export async function deleteClassFeeType(classId: number, feeTypeId: number) {
  await db.delete(classFeeTypes)
    .where(and(eq(classFeeTypes.classId, classId), eq(classFeeTypes.feeTypeId, feeTypeId)));
}

export async function deleteClassFeeTypesByClass(classId: number) {
  await db.delete(classFeeTypes)
    .where(eq(classFeeTypes.classId, classId));
}

export async function setClassFeeTypes(classId: number, items: { feeTypeId: number; amount: number | null }[]) {
  await deleteClassFeeTypesByClass(classId);
  if (items.length === 0) return;
  await db.insert(classFeeTypes)
    .values(items.map(item => ({ classId, feeTypeId: item.feeTypeId, amount: item.amount })));
}
