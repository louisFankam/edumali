import { db } from "@/lib/db";
import { expenses } from "@/lib/models/schema";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";

function buildConditions(filters?: { from?: string; to?: string; category?: string }) {
  const conditions = [];
  if (filters?.from) conditions.push(gte(expenses.date, filters.from));
  if (filters?.to) conditions.push(lte(expenses.date, filters.to));
  if (filters?.category && filters.category !== "all") conditions.push(eq(expenses.category, filters.category));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function countExpenses(filters?: { from?: string; to?: string; category?: string }) {
  const where = buildConditions(filters);
  const rows = await db.select({ total: count() }).from(expenses).where(where);
  return rows[0]?.total ?? 0;
}

export async function findAllExpenses(filters?: { from?: string; to?: string; category?: string; page?: number; limit?: number }) {
  const where = buildConditions(filters);
  let query = db.select().from(expenses).where(where).orderBy(desc(expenses.date));
  if (filters?.page && filters?.limit) {
    const offset = (filters.page - 1) * filters.limit;
    query = query.limit(filters.limit).offset(offset);
  }
  return query;
}

export async function findExpenseById(id: number) {
  const rows = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  return rows[0];
}

export async function createExpense(input: {
  description: string; amount: number; category: string; categoryCustom?: string; date: string; notes?: string;
}) {
  const [created] = await db.insert(expenses).values(input).returning();
  return created;
}

export async function updateExpense(id: number, input: Partial<{
  description: string; amount: number; category: string; categoryCustom?: string; date: string; notes: string;
}>) {
  const [updated] = await db.update(expenses).set(input).where(eq(expenses.id, id)).returning();
  return updated;
}

export async function deleteExpense(id: number) {
  await db.delete(expenses).where(eq(expenses.id, id));
}
