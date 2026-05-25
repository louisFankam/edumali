import {
  findAllFeeTypes, findFeeTypeById, createFeeType, updateFeeType, deleteFeeType,
  findAllPayments, findPaymentById, createPayment, updatePayment, deletePayment,
  getPaymentStats, getStudentPaymentSummary,
} from "@/lib/repositories/payment.repository";

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

export async function addFeeType(input: { name: string; amount: number; period: string; description?: string }) {
  const created = await createFeeType(input);
  return mapFeeType(created);
}

export async function editFeeType(id: string, input: Partial<{ name: string; amount: number; period: string; description: string }>) {
  const updated = await updateFeeType(Number(id), input);
  return mapFeeType(updated);
}

export async function removeFeeType(id: string) {
  await deleteFeeType(Number(id));
}

export async function getPayments(filters?: { studentId?: string; from?: string; to?: string }) {
  const rows = await findAllPayments({
    studentId: filters?.studentId ? Number(filters.studentId) : undefined,
    from: filters?.from, to: filters?.to,
  });
  return rows.map(mapPayment);
}

export async function getPaymentById(id: string) {
  const row = await findPaymentById(Number(id));
  return mapPayment(row);
}

export async function addPayment(input: {
  studentId: number; feeTypeId?: number; amount: number; method: string; reference?: string; date: string; notes?: string;
}) {
  const created = await createPayment(input);
  return mapPayment(created);
}

export async function editPayment(id: string, input: Partial<{ amount: number; method: string; reference: string; status: string; notes: string }>) {
  const updated = await updatePayment(Number(id), input);
  return mapPayment(updated);
}

export async function removePayment(id: string) {
  await deletePayment(Number(id));
}

export async function getPaymentStatsService(from?: string, to?: string) {
  return getPaymentStats(from, to);
}

export async function getStudentPaymentSummaryService(studentId: string) {
  return getStudentPaymentSummary(Number(studentId));
}
