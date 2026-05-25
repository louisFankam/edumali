import {
  findAllExpenses, countExpenses, findExpenseById, createExpense, updateExpense, deleteExpense,
} from "@/lib/repositories/expense.repository";
import { checkPeriodClosed } from "@/lib/services/period.service";
import { logAudit } from "@/lib/services/audit.service";

const categoryLabels: Record<string, string> = {
  eau: "Eau", electricite: "Électricité", fournitures: "Fournitures",
  entretien: "Entretien", transport: "Transport", equipement: "Équipement", autres: "Autres",
};

function mapExpense(e: any) {
  return {
    id: String(e.id),
    description: e.description,
    amount: e.amount,
    category: e.category,
    categoryLabel: categoryLabels[e.category] || e.category,
    categoryCustom: e.categoryCustom || null,
    date: e.date,
    notes: e.notes || null,
  };
}

export async function getExpenses(filters?: { from?: string; to?: string; category?: string; page?: number; limit?: number }) {
  const rows = await findAllExpenses(filters);
  const items = rows.map(mapExpense);
  const total = await countExpenses(filters);
  return { data: items, total };
}

export async function getExpenseById(id: string) {
  const row = await findExpenseById(Number(id));
  if (!row) return null;
  return mapExpense(row);
}

export async function addExpense(input: {
  description: string; amount: number; category: string; categoryCustom?: string; date: string; notes?: string;
}) {
  const created = await createExpense(input);
  logAudit({
    tableName: "expenses", recordId: created.id,
    action: "create", newValues: input,
  });
  return mapExpense(created);
}

export async function editExpense(id: string, input: Partial<{
  description: string; amount: number; category: string; categoryCustom?: string; date: string; notes: string;
}>) {
  const existing = await findExpenseById(Number(id));
  if (!existing) throw new Error("Dépense introuvable");
  if (input.date && await checkPeriodClosed(input.date)) {
    throw new Error("Cette période est clôturée, modification impossible");
  }
  if (!input.date && await checkPeriodClosed(existing.date)) {
    throw new Error("Cette période est clôturée, modification impossible");
  }
  const updated = await updateExpense(Number(id), input);
  logAudit({
    tableName: "expenses", recordId: Number(id),
    action: "update", oldValues: existing, newValues: { ...existing, ...input },
  });
  return mapExpense(updated);
}

export async function removeExpense(id: string) {
  const existing = await findExpenseById(Number(id));
  if (!existing) throw new Error("Dépense introuvable");
  if (await checkPeriodClosed(existing.date)) {
    throw new Error("Cette période est clôturée, suppression impossible");
  }
  await deleteExpense(Number(id));
  logAudit({
    tableName: "expenses", recordId: Number(id),
    action: "delete", oldValues: existing,
  });
}
