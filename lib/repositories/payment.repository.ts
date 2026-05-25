import { and, eq, gte, lte, sql, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, feeTypes, students } from "@/lib/models/schema";

// Fee Types
export async function findAllFeeTypes() {
  return db.query.feeTypes.findMany({ orderBy: (f, { asc }) => [asc(f.name)] });
}

export async function findFeeTypeById(id: number) {
  return db.query.feeTypes.findFirst({ where: eq(feeTypes.id, id) });
}

export async function createFeeType(input: { name: string; amount: number; period: string; description?: string }) {
  const [created] = await db.insert(feeTypes).values(input).returning();
  return created;
}

export async function updateFeeType(id: number, input: Partial<{ name: string; amount: number; period: string; description: string }>) {
  const [updated] = await db.update(feeTypes).set({ ...input, updatedAt: new Date() }).where(eq(feeTypes.id, id)).returning();
  return updated;
}

export async function deleteFeeType(id: number) {
  await db.delete(feeTypes).where(eq(feeTypes.id, id));
}

// Payments
function paymentConditions(filters?: { studentId?: number; from?: string; to?: string }) {
  const conditions: any[] = [];
  if (filters?.studentId) conditions.push(eq(payments.studentId, filters.studentId));
  if (filters?.from) conditions.push(gte(payments.date, filters.from));
  if (filters?.to) conditions.push(lte(payments.date, filters.to));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function countPayments(filters?: { studentId?: number; from?: string; to?: string }) {
  const rows = await db.select({ total: count() }).from(payments).where(paymentConditions(filters));
  return rows[0]?.total ?? 0;
}

export async function findAllPayments(filters?: { studentId?: number; from?: string; to?: string; page?: number; limit?: number }) {
  const where = paymentConditions(filters);
  let query = db.query.payments.findMany({
    where,
    with: { student: true, feeType: true },
    orderBy: (p, { desc }) => [desc(p.date)],
  });
  if (filters?.page && filters?.limit) {
    const offset = (filters.page - 1) * filters.limit;
    query = db.query.payments.findMany({
      where,
      with: { student: true, feeType: true },
      orderBy: (p, { desc }) => [desc(p.date)],
      limit: filters.limit,
      offset,
    });
  }
  return query;
}

export async function findPaymentById(id: number) {
  return db.query.payments.findFirst({ where: eq(payments.id, id), with: { student: true, feeType: true } });
}

export async function createPayment(input: { studentId: number; feeTypeId?: number; amount: number; method: string; reference?: string; date: string; notes?: string }) {
  const [created] = await db.insert(payments).values({ ...input, status: "payé" }).returning();
  return created;
}

export async function updatePayment(id: number, input: Partial<{ amount: number; method: string; reference: string; status: string; notes: string }>) {
  const [updated] = await db.update(payments).set({ ...input, updatedAt: new Date() }).where(eq(payments.id, id)).returning();
  return updated;
}

export async function deletePayment(id: number) {
  await db.delete(payments).where(eq(payments.id, id));
}

export async function getPaymentStats(from?: string, to?: string) {
  const conditions: any[] = [];
  if (from) conditions.push(gte(payments.date, from));
  if (to) conditions.push(lte(payments.date, to));
  conditions.push(eq(payments.status, "payé"));

  const result = await db.select({
    total: sql<number>`coalesce(sum(amount), 0)`.as("total"),
    count: sql<number>`count(*)`.as("count"),
  }).from(payments).where(and(...conditions));

  return { totalRevenue: result[0]?.total ?? 0, totalPayments: result[0]?.count ?? 0 };
}

export async function getStudentPaymentSummary(studentId: number) {
  const rows = await db.select({
    totalPaid: sql<number>`coalesce(sum(amount), 0)`.as("total_paid"),
  }).from(payments).where(and(eq(payments.studentId, studentId), eq(payments.status, "payé")));

  return { totalPaid: rows[0]?.totalPaid ?? 0 };
}
