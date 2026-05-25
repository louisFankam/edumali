import {
  findAllEvaluations, findEvaluationById, createEvaluation,
  updateEvaluation, deleteEvaluation, EvaluationFilters,
} from "@/lib/repositories/evaluation.repository";
import { deleteGrade } from "@/lib/repositories/grade.repository";

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
}) {
  const row = await createEvaluation(input);
  return { id: String(row.id) };
}

export async function editEvaluation(id: string, input: Partial<{
  name: string; type: string; classId: number; subjectId: number;
  trimester: number; date: string; status: string;
}>) {
  await updateEvaluation(Number(id), input);
  return { id };
}

export async function removeEvaluation(id: string) {
  await deleteEvaluation(Number(id));
}
