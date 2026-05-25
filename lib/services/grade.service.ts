import { findGradesByEvaluation, bulkSaveGrades } from "@/lib/repositories/grade.repository";

export async function getGrades(evaluationId: string) {
  const rows = await findGradesByEvaluation(Number(evaluationId));
  return rows.map(r => ({
    id: String(r.id),
    evaluationId: String(r.evaluationId),
    studentId: String(r.studentId),
    score: r.score,
    remarks: r.remarks || "",
    studentFirstName: r.studentFirstName,
    studentLastName: r.studentLastName,
  }));
}

export async function saveGrades(evaluationId: string, gradeInputs: {
  studentId: number; score: number; remarks?: string;
}[]) {
  const rows = await bulkSaveGrades(Number(evaluationId), gradeInputs);
  return rows.map(r => ({ id: String(r.id) }));
}

export async function getGradeStats(evaluationId: string) {
  const rows = await findGradesByEvaluation(Number(evaluationId));
  if (rows.length === 0) {
    return { count: 0, average: 0, min: 0, max: 0, successRate: 0 };
  }
  const scores = rows.map(r => r.score);
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
  };
}
