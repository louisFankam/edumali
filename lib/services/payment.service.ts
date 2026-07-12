import { sql } from "drizzle-orm";
import { db, rawDb } from "@/lib/db";
import {
  findAllFeeTypes, findFeeTypeById, createFeeType, updateFeeType, deleteFeeType,
  findAllPayments, countPayments, findPaymentById, createPayment, updatePayment, deletePayment,
  getPaymentStats, getStudentPaymentSummary, findUnpaidStudents,
} from "@/lib/repositories/payment.repository";
import { checkPeriodClosed } from "@/lib/services/period.service";
import { logAudit } from "@/lib/services/audit.service";
import { validateAmount } from "./amount.validation";

function mapFeeType(f: any) {
  if (!f) return null;
  return { id: String(f.id), name: f.name, amount: f.amount, period: f.period, description: f.description };
}

function mapPayment(p: any) {
  if (!p) return null;
  return {
    id: String(p.id), studentId: String(p.studentId), feeTypeId: p.feeTypeId ? String(p.feeTypeId) : null,
    amount: p.amount, method: p.method, reference: p.reference, date: p.date, status: p.status, notes: p.notes,
    studentName: p.student ? `${p.student.firstName} ${p.student.lastName}` : undefined,
    feeTypeName: p.feeType?.name,
  };
}

export async function getFeeTypes() {
  const rows = await findAllFeeTypes();
  return rows.map(mapFeeType);
}

export async function addFeeType(input: { name: string; amount: number; period: string; description?: string }, userId?: number) {
  const created = await createFeeType(input);
  logAudit({ tableName: "fee_types", recordId: created.id, action: "create", userId, newValues: input as any });
  return mapFeeType(created);
}

export async function editFeeType(id: string, input: Partial<{ name: string; amount: number; period: string; description: string }>, userId?: number) {
  const old = await findFeeTypeById(Number(id));
  const updated = await updateFeeType(Number(id), input);
  logAudit({ tableName: "fee_types", recordId: Number(id), action: "update", userId, oldValues: old ?? undefined, newValues: input as any });
  return mapFeeType(updated);
}

export async function removeFeeType(id: string, userId?: number) {
  const old = await findFeeTypeById(Number(id));
  logAudit({ tableName: "fee_types", recordId: Number(id), action: "delete", userId, oldValues: old ?? undefined });
  await deleteFeeType(Number(id));
}

export async function getPayments(filters?: { studentId?: string; from?: string; to?: string; classId?: string; page?: number; limit?: number }) {
  const rows = await findAllPayments({
    studentId: filters?.studentId ? Number(filters.studentId) : undefined,
    from: filters?.from, to: filters?.to,
    classId: filters?.classId ? Number(filters.classId) : undefined,
    page: filters?.page, limit: filters?.limit,
  });
  const items = rows.map(mapPayment);
  const total = await countPayments({
    studentId: filters?.studentId ? Number(filters.studentId) : undefined,
    from: filters?.from, to: filters?.to,
    classId: filters?.classId ? Number(filters.classId) : undefined,
  });
  return { data: items, total };
}

export async function getPaymentById(id: string) {
  const row = await findPaymentById(Number(id));
  return mapPayment(row);
}

export async function addPayment(input: {
  studentId: number; feeTypeId?: number; amount: number; method: string; reference?: string; date: string; notes?: string;
}, userId?: number) {
  validateAmount(input.amount);

  if (await checkPeriodClosed(input.date)) {
    throw new Error("Cette période est clôturée, ajout de paiement impossible");
  }

  const createdId = rawDb.transaction(() => {
    const row = rawDb.prepare(`
      SELECT c.total_fee, s.discount_type, s.discount_value,
        COALESCE((SELECT SUM(COALESCE(cft.amount, ft.amount)) FROM class_fee_types cft JOIN fee_types ft ON ft.id = cft.fee_type_id WHERE cft.class_id = c.id), 0) as supplementary_fees
      FROM students s
      JOIN classes c ON c.id = s.class_id
      WHERE s.id = ?
    `).get(input.studentId) as { total_fee: number; discount_type: string | null; discount_value: number | null; supplementary_fees: number } | undefined;

    if (row) {
      let netFee = row.total_fee + row.supplementary_fees;
      if (row.discount_type === "percentage") {
        netFee -= row.total_fee * (row.discount_value ?? 0) / 100;
      } else if (row.discount_type === "fixed") {
        netFee -= row.discount_value ?? 0;
      }
      const totalPaid = (rawDb.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE student_id = ? AND status = 'payé'
      `).get(input.studentId) as { total_paid: number }).total_paid;

      if (totalPaid + input.amount > netFee) {
        throw new Error(`Le paiement dépasserait le montant dû (${netFee.toLocaleString()} FCFA)`);
      }
    }

    const info = rawDb.prepare(`
      INSERT INTO payments (student_id, fee_type_id, amount, method, reference, date, notes, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'payé', ?, ?)
    `).run(
      input.studentId,
      input.feeTypeId ?? null,
      input.amount,
      input.method,
      input.reference ?? null,
      input.date,
      input.notes ?? null,
      Date.now(),
      Date.now(),
    );

    return Number(info.lastInsertRowid);
  })();

  const created = await findPaymentById(createdId);
  logAudit({
    tableName: "payments", recordId: createdId,
    action: "create", userId, newValues: input,
  });
  return mapPayment(created);
}

export async function editPayment(id: string, input: Partial<{ amount: number; method: string; reference: string; status: string; notes: string }>, userId?: number) {
  const existing = await findPaymentById(Number(id));
  if (!existing) throw new Error("Paiement introuvable");
  if (await checkPeriodClosed(existing.date)) {
    throw new Error("Cette période est clôturée, modification impossible");
  }

  if (input.amount !== undefined) {
    validateAmount(input.amount);

    const row = rawDb.prepare(`
      SELECT c.total_fee, s.discount_type, s.discount_value,
        COALESCE((SELECT SUM(COALESCE(cft.amount, ft.amount)) FROM class_fee_types cft JOIN fee_types ft ON ft.id = cft.fee_type_id WHERE cft.class_id = c.id), 0) as supplementary_fees
      FROM students s
      JOIN classes c ON c.id = s.class_id
      WHERE s.id = ?
    `).get(existing.studentId) as { total_fee: number; discount_type: string | null; discount_value: number | null; supplementary_fees: number } | undefined;

    if (row) {
      let netFee = row.total_fee + row.supplementary_fees;
      if (row.discount_type === "percentage") {
        netFee -= row.total_fee * (row.discount_value ?? 0) / 100;
      } else if (row.discount_type === "fixed") {
        netFee -= row.discount_value ?? 0;
      }
      const totalPaid = (rawDb.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE student_id = ? AND status = 'payé' AND id != ?
      `).get(existing.studentId, Number(id)) as { total_paid: number }).total_paid;

      if (totalPaid + input.amount > netFee) {
        throw new Error(`Le nouveau montant dépasserait le total dû (${netFee.toLocaleString()} FCFA)`);
      }
    }
  }

  const updated = await updatePayment(Number(id), input);
  logAudit({
    tableName: "payments", recordId: Number(id),
    action: "update", userId, oldValues: existing, newValues: { ...existing, ...input },
  });
  return mapPayment(updated);
}

export async function removePayment(id: string, userId?: number) {
  const existing = await findPaymentById(Number(id));
  if (!existing) throw new Error("Paiement introuvable");
  if (await checkPeriodClosed(existing.date)) {
    throw new Error("Cette période est clôturée, suppression impossible");
  }
  await deletePayment(Number(id));
  logAudit({
    tableName: "payments", recordId: Number(id),
    action: "delete", userId, oldValues: existing,
  });
}

export async function getPaymentStatsService(from?: string, to?: string) {
  return getPaymentStats(from, to);
}

export async function getStudentPaymentSummaryService(studentId: string) {
  return getStudentPaymentSummary(Number(studentId));
}

export async function getUnpaidStudents(filters?: { classId?: string; academicYearId?: string; page?: number; limit?: number }) {
  const result = await findUnpaidStudents({
    classId: filters?.classId ? Number(filters.classId) : undefined,
    academicYearId: filters?.academicYearId ? Number(filters.academicYearId) : undefined,
    page: filters?.page,
    limit: filters?.limit,
  });
  const data = result.data.map(r => ({
    id: String(r.id),
    firstName: r.first_name,
    lastName: r.last_name,
    classId: String(r.class_id),
    className: r.class_name,
    totalFee: r.total_fee,
    totalPaid: r.total_paid,
    discountType: r.discount_type,
    discountValue: r.discount_value,
    netFee: r.net_fee,
    remaining: r.net_fee - r.total_paid,
  }));
  return { data, total: result.total };
}
