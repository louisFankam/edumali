import { findGradesByEvaluation, bulkSaveGrades, countStudentsByEvaluation, countAbsentByEvaluation } from "@/lib/repositories/grade.repository";
import { findEvaluationById } from "@/lib/repositories/evaluation.repository";
import { checkPeriodClosed } from "@/lib/services/period.service";
import { logAudit } from "@/lib/services/audit.service";

export async function getGrades(evaluationId: string) {
  const rows = await findGradesByEvaluation(Number(evaluationId));
  return rows.map(r => ({
    id: String(r.id),
    evaluationId: String(r.evaluationId),
    studentId: String(r.studentId),
    score: r.score,
    remarks: r.remarks || "",
    isAbsent: Boolean(r.isAbsent),
    studentFirstName: r.studentFirstName,
    studentLastName: r.studentLastName,
  }));
}

export async function saveGrades(evaluationId: string, gradeInputs: {
  studentId: number; score: number; remarks?: string; isAbsent?: boolean;
}[], userId?: number) {
  const evalRow = await findEvaluationById(Number(evaluationId));
  if (evalRow && await checkPeriodClosed(evalRow.date)) {
    throw new Error("Impossible de sauvegarder des notes : la période est clôturée");
  }
  const rows = await bulkSaveGrades(Number(evaluationId), gradeInputs);
  logAudit({ tableName: "grades", recordId: 0, action: "create", userId, newValues: { batch: true, count: gradeInputs.length, evaluationId } });
  return rows.map(r => ({ id: String(r.id) }));
}

export async function getGradeStats(evaluationId: string) {
  const rows = await findGradesByEvaluation(Number(evaluationId));
  const absentCount = await countAbsentByEvaluation(Number(evaluationId));
  const totalStudents = await countStudentsByEvaluation(Number(evaluationId));
  const presentRows = rows.filter(r => !r.isAbsent);
  if (presentRows.length === 0) {
    return { count: 0, average: 0, min: 0, max: 0, successRate: 0, absentCount, totalStudents, missingCount: 0 };
  }
  const scores = presentRows.map(r => r.score);
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const passed = scores.filter(s => s >= 10).length;
  return {
    count: scores.length,
    average: Math.round(average * 100) / 100,
    min,
    max,
    successRate: Math.round((passed / scores.length) * 100),
    absentCount,
    totalStudents,
    missingCount: Math.max(0, totalStudents - scores.length - absentCount),
  };
}
