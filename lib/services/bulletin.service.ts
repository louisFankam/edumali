import { findEvaluationsByClassAndTrimester } from "@/lib/repositories/evaluation.repository";
import { findGradesByEvaluation } from "@/lib/repositories/grade.repository";
import { db } from "@/lib/db";
import { students, subjects, classes, academicYears, enrollments } from "@/lib/models/schema";
import { eq, and } from "drizzle-orm";

export interface SubjectBulletin {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  devoirScores: number[];
  trimestrielleScore: number | null;
  devoirAverage: number | null;
  finalAverage: number;
}

export interface StudentBulletin {
  studentId: string;
  firstName: string;
  lastName: string;
  subjects: SubjectBulletin[];
  generalAverage: number;
  rank: number;
  mention: string;
  totalCoeffs: number;
  weightedSum: number;
}

export async function computeClassBulletin(classId: number, trimester: number, academicYearId: number) {
  const classRow = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  if (!classRow[0]) throw new Error("Classe introuvable");

  const evals = await findEvaluationsByClassAndTrimester(classId, trimester, academicYearId);
  if (evals.length === 0) throw new Error("Aucune évaluation trouvée pour ce trimestre");

  const subjectIds = [...new Set(evals.map(e => e.subjectId))];
  const subjectRows = await db.select().from(subjects);
  const subjectMap = new Map(subjectRows.map(s => [s.id, s]));

  const studentRows = await db.select({
    id: students.id, firstName: students.firstName, lastName: students.lastName,
  }).from(students)
    .innerJoin(enrollments, and(
      eq(enrollments.studentId, students.id),
      eq(enrollments.classId, classId),
      eq(enrollments.academicYearId, academicYearId),
      eq(enrollments.status, "inscrit"),
    ));

  const bulletins: StudentBulletin[] = [];

  for (const student of studentRows) {
    const subjectsData: SubjectBulletin[] = [];

    for (const subjId of subjectIds) {
      const subj = subjectMap.get(subjId);
      if (!subj) continue;

      const subjEvals = evals.filter(e => e.subjectId === subjId);
      const devoirs = subjEvals.filter(e => e.type === "devoir" && e.status === "published");
      const trimestrielles = subjEvals.filter(e => e.type === "trimestrielle" && e.status === "published");

      const devoirScores: number[] = [];
      for (const d of devoirs) {
        const gradeRows = await findGradesByEvaluation(d.id);
        const match = gradeRows.find(g => g.studentId === Number(student.id));
        if (match) devoirScores.push(match.score);
      }

      let trimestrielleScore: number | null = null;
      if (trimestrielles.length > 0) {
        const t = trimestrielles[0];
        const gradeRows = await findGradesByEvaluation(t.id);
        const match = gradeRows.find(g => g.studentId === Number(student.id));
        if (match) trimestrielleScore = match.score;
      }

      const devoirAvg = devoirScores.length > 0
        ? devoirScores.reduce((a, b) => a + b, 0) / devoirScores.length
        : null;

      let finalAvg: number;
      if (devoirAvg !== null && trimestrielleScore !== null) {
        finalAvg = devoirAvg * 0.5 + trimestrielleScore * 0.5;
      } else if (devoirAvg !== null) {
        finalAvg = devoirAvg;
      } else if (trimestrielleScore !== null) {
        finalAvg = trimestrielleScore;
      } else {
        continue;
      }

      subjectsData.push({
        subjectId: String(subj.id),
        subjectName: subj.name,
        coefficient: subj.coefficient || 1,
        devoirScores,
        trimestrielleScore,
        devoirAverage: devoirAvg !== null ? Math.round(devoirAvg * 100) / 100 : null,
        finalAverage: Math.round(finalAvg * 100) / 100,
      });
    }

    const totalCoeffs = subjectsData.reduce((s, sb) => s + sb.coefficient, 0);
    const weightedSum = subjectsData.reduce((s, sb) => s + sb.finalAverage * sb.coefficient, 0);
    const generalAverage = totalCoeffs > 0
      ? Math.round((weightedSum / totalCoeffs) * 100) / 100
      : 0;

    const mention = generalAverage >= 16 ? "Très bien"
      : generalAverage >= 14 ? "Bien"
      : generalAverage >= 12 ? "Assez bien"
      : generalAverage >= 10 ? "Passable"
      : "Insuffisant";

    bulletins.push({
      studentId: String(student.id),
      firstName: student.firstName,
      lastName: student.lastName,
      subjects: subjectsData,
      generalAverage,
      rank: 0,
      mention,
      totalCoeffs,
      weightedSum,
    });
  }

  bulletins.sort((a, b) => b.generalAverage - a.generalAverage);
  bulletins.forEach((b, i) => { b.rank = i + 1; });

  return {
    className: classRow[0].name,
    trimester,
    students: bulletins,
    subjectCount: subjectIds.length,
    studentCount: bulletins.length,
  };
}
