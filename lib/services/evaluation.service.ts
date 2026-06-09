import {
  findAllEvaluations, findEvaluationById, createEvaluation,
  updateEvaluation, deleteEvaluation, EvaluationFilters,
} from "@/lib/repositories/evaluation.repository";
import { deleteGrade } from "@/lib/repositories/grade.repository";
import { checkPeriodClosed } from "@/lib/services/period.service";
import { logAudit } from "@/lib/services/audit.service";

function mapEvaluation(row: any) {
  return {
    id: String(row.id),
    name: row.name,
    type: row.type,
    classId: String(row.classId),
    subjectId: String(row.subjectId),
    trimester: row.trimester,
    academicYearId: String(row.academicYearId),
    date: row.date,
    status: row.status,
    className: row.className || "",
    subjectName: row.subjectName || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getEvaluations(filters?: EvaluationFilters) {
  const rows = await findAllEvaluations(filters);
  return rows.map(mapEvaluation);
}

export async function getEvaluationById(id: string) {
  const row = await findEvaluationById(Number(id));
  if (!row) return null;
  return mapEvaluation(row);
}

export async function addEvaluation(input: {
  name: string; type: string; classId: number; subjectId: number;
  trimester: number; academicYearId: number; date: string;
}, userId?: number) {
  if (await checkPeriodClosed(input.date)) {
    throw new Error("Impossible d'ajouter une évaluation : la période est clôturée");
  }
  const row = await createEvaluation(input);
  logAudit({ tableName: "evaluations", recordId: row.id, action: "create", userId, newValues: input as any });
  return { id: String(row.id) };
}

export async function editEvaluation(id: string, input: Partial<{
  name: string; type: string; classId: number; subjectId: number;
  trimester: number; date: string; status: string;
}>, userId?: number) {
  if (input.date && await checkPeriodClosed(input.date)) {
    throw new Error("Impossible de modifier une évaluation : la période est clôturée");
  }
  if (!input.date) {
    const existing = await findEvaluationById(Number(id));
    if (existing && await checkPeriodClosed(existing.date)) {
      throw new Error("Impossible de modifier une évaluation : la période est clôturée");
    }
  }
  const old = await findEvaluationById(Number(id));
  await updateEvaluation(Number(id), input);
  logAudit({ tableName: "evaluations", recordId: Number(id), action: "update", userId, oldValues: old ?? undefined, newValues: input as any });
  return { id };
}

export async function removeEvaluation(id: string, userId?: number) {
  const existing = await findEvaluationById(Number(id));
  if (existing && await checkPeriodClosed(existing.date)) {
    throw new Error("Impossible de supprimer une évaluation : la période est clôturée");
  }
  const old = await findEvaluationById(Number(id));
  logAudit({ tableName: "evaluations", recordId: Number(id), action: "delete", userId, oldValues: old ?? undefined });
  await deleteEvaluation(Number(id));
}
