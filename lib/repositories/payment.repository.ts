import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, feeTypes, students, classes } from "@/lib/models/schema";

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
function paymentConditions(filters?: { studentId?: number; from?: string; to?: string; classId?: number }) {
  const conditions: any[] = [];
  if (filters?.studentId) conditions.push(eq(payments.studentId, filters.studentId));
  if (filters?.from) conditions.push(gte(payments.date, filters.from));
  if (filters?.to) conditions.push(lte(payments.date, filters.to));
  if (filters?.classId) {
    conditions.push(sql`${payments.studentId} IN (SELECT id FROM students WHERE class_id = ${filters.classId})`);
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function countPayments(filters?: { studentId?: number; from?: string; to?: string; classId?: number }) {
  const cond = paymentConditions(filters);
  if (!cond) {
    const raw = db.prepare("SELECT COUNT(*) as total FROM payments").get() as { total: number };
    return raw.total;
  }
  const rows = await db.select({ total: sql<number>`count(*)` }).from(payments).where(cond);
  return Number(rows[0]?.total ?? 0);
}

export async function findAllPayments(filters?: { studentId?: number; from?: string; to?: string; classId?: number; page?: number; limit?: number }) {
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

export async function findUnpaidStudents(filters?: { classId?: number; academicYearId?: number; page?: number; limit?: number }) {
  let conditions = sql`s.status = 'Actif'`;
  if (filters?.classId) {
    conditions = sql`${conditions} AND s.class_id = ${filters.classId}`;
  }

  const joinClause = filters?.academicYearId
    ? sql`JOIN enrollments e ON e.student_id = s.id AND e.academic_year_id = ${filters.academicYearId}`
    : sql``;

  const supplementSql = sql`COALESCE((SELECT SUM(COALESCE(cft.amount, ft.amount)) FROM class_fee_types cft JOIN fee_types ft ON ft.id = cft.fee_type_id WHERE cft.class_id = c.id), 0)`

  const countResult = db.get(sql`
    SELECT COUNT(*) as total FROM (
      SELECT s.id
      FROM students s
      ${joinClause}
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN payments p ON p.student_id = s.id AND p.status = 'payé'
      WHERE ${conditions}
      GROUP BY s.id
      HAVING COALESCE(SUM(p.amount), 0) <
        CASE
          WHEN s.discount_type = 'percentage' THEN c.total_fee * (1 - s.discount_value / 100.0) + ${supplementSql}
          WHEN s.discount_type = 'fixed' THEN c.total_fee - s.discount_value + ${supplementSql}
          ELSE c.total_fee + ${supplementSql}
        END
    )
  `) as { total: number } | undefined;
  const total = countResult?.total ?? 0;

  let limitOffset = sql``;
  if (filters?.page && filters?.limit) {
    const offset = (filters.page - 1) * filters.limit;
    limitOffset = sql`LIMIT ${filters.limit} OFFSET ${offset}`;
  }

  const rows = db.all(sql`
    SELECT s.id, s.first_name, s.last_name, s.class_id,
           c.name as class_name, c.total_fee,
           ${supplementSql} as supplementary_fees,
           s.discount_type, s.discount_value,
           COALESCE(SUM(p.amount), 0) as total_paid,
           CASE
             WHEN s.discount_type = 'percentage' THEN c.total_fee * (1 - s.discount_value / 100.0) + ${supplementSql}
             WHEN s.discount_type = 'fixed' THEN c.total_fee - s.discount_value + ${supplementSql}
             ELSE c.total_fee + ${supplementSql}
           END as net_fee
    FROM students s
    ${joinClause}
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN payments p ON p.student_id = s.id AND p.status = 'payé'
    WHERE ${conditions}
    GROUP BY s.id
    HAVING COALESCE(SUM(p.amount), 0) <
      CASE
        WHEN s.discount_type = 'percentage' THEN c.total_fee * (1 - s.discount_value / 100.0) + ${supplementSql}
        WHEN s.discount_type = 'fixed' THEN c.total_fee - s.discount_value + ${supplementSql}
        ELSE c.total_fee + ${supplementSql}
      END
    ORDER BY s.last_name, s.first_name
    ${limitOffset}
  `) as { id: number; first_name: string; last_name: string; class_id: number; class_name: string; total_fee: number; supplementary_fees: number; total_paid: number; discount_type: string | null; discount_value: number | null; net_fee: number }[];

  return { data: rows, total };
}
