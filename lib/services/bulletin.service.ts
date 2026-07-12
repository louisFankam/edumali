import { findEvaluationsByClassAndTrimester } from "@/lib/repositories/evaluation.repository";
import { findGradesByEvaluations } from "@/lib/repositories/grade.repository";
import { db } from "@/lib/db";
import { students, subjects, classes, academicYears, enrollments, classSubjects } from "@/lib/models/schema";
import { eq, and } from "drizzle-orm";

export interface SubjectBulletin {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  devoirScores: number[];
  trimestrielleScore: number | null;
  devoirAverage: number | null;
  finalAverage: number | null;
  absent: boolean;
  appreciation: string;
}

export interface StudentBulletin {
  studentId: string;
  firstName: string;
  lastName: string;
  subjects: SubjectBulletin[];
  generalAverage: number | null;
  rank: number | null;
  totalStudents: number;
  mention: string;
  totalActiveCoeffs: number;
  weightedSum: number;
  absentCount: number;
}

export async function computeClassBulletin(classId: number, trimester: number, academicYearId: number, includeAbsentCoeff: boolean = false) {
  const classRow = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  if (!classRow[0]) throw new Error("Classe introuvable");

  const evals = await findEvaluationsByClassAndTrimester(classId, trimester, academicYearId);
  if (evals.length === 0) throw new Error("Aucune évaluation trouvée pour ce trimestre");

  const subjectIds = [...new Set(evals.map(e => e.subjectId))] as number[];
  const subjectRows = await db.select().from(subjects);
  const subjectMap = new Map(subjectRows.map(s => [s.id, s]));

  const classSubjectRows = await db.select().from(classSubjects)
    .where(and(eq(classSubjects.classId, classId)));
  const classSubjCoeff = new Map(classSubjectRows.map(cs => [cs.subjectId, cs.coefficient]));

  const studentRows = await db.select({
    id: students.id, firstName: students.firstName, lastName: students.lastName,
  }).from(students)
    .innerJoin(enrollments, and(
      eq(enrollments.studentId, students.id),
      eq(enrollments.classId, classId),
      eq(enrollments.academicYearId, academicYearId),
      eq(enrollments.status, "inscrit"),
    ))
    .orderBy(students.lastName, students.firstName);

  const evalIds = evals.map(e => e.id);
  const allGrades = await findGradesByEvaluations(evalIds);
  const gradeMap = new Map<number, Map<number, typeof allGrades[number]>>();
  for (const g of allGrades) {
    if (!gradeMap.has(g.evaluationId)) gradeMap.set(g.evaluationId, new Map());
    gradeMap.get(g.evaluationId)!.set(g.studentId, g);
  }

  const bulletins: StudentBulletin[] = [];

  for (const student of studentRows) {
    const subjectsData: SubjectBulletin[] = [];
    const studentIdNum = Number(student.id);

    for (const subjId of subjectIds) {
      const subj = subjectMap.get(subjId);
      if (!subj) continue;

      const coeff = classSubjCoeff.get(subjId) ?? subj.coefficient ?? 1;

      const subjEvals = evals.filter(e => e.subjectId === subjId);
      const devoirs = subjEvals.filter(e => e.type === "devoir");
      const trimestrielles = subjEvals.filter(e => e.type === "trimestrielle");

      const devoirScores: number[] = [];
      for (const d of devoirs) {
        const match = gradeMap.get(d.id)?.get(studentIdNum);
        if (match && !match.isAbsent) {
          devoirScores.push(match.score);
        }
      }

      let trimestrielleScore: number | null = null;
      let trimAbsent = false;
      if (trimestrielles.length > 0) {
        const match = gradeMap.get(trimestrielles[0].id)?.get(studentIdNum);
        if (match) {
          if (!match.isAbsent) {
            trimestrielleScore = match.score;
          } else {
            trimAbsent = true;
          }
        }
      }

      const devoirAvg = devoirScores.length > 0
        ? devoirScores.reduce((a, b) => a + b, 0) / devoirScores.length
        : null;

      let finalAvg: number | null = null;
      if (devoirAvg !== null && trimestrielleScore !== null) {
        finalAvg = devoirAvg * 0.5 + trimestrielleScore * 0.5;
      } else if (devoirAvg !== null) {
        finalAvg = devoirAvg;
      } else if (trimestrielleScore !== null) {
        finalAvg = trimestrielleScore;
      } else {
        subjectsData.push({
          subjectId: String(subj.id),
          subjectName: subj.name,
          coefficient: coeff,
          devoirScores,
          trimestrielleScore: null,
          devoirAverage: null,
          finalAverage: null,
          absent: true,
          appreciation: "Absent",
        });
        continue;
      }

      subjectsData.push({
        subjectId: String(subj.id),
        subjectName: subj.name,
        coefficient: coeff,
        devoirScores,
        trimestrielleScore,
        devoirAverage: devoirAvg !== null ? Math.round(devoirAvg * 100) / 100 : null,
        finalAverage: Math.round(finalAvg * 100) / 100,
        absent: false,
        appreciation: finalAvg >= 16 ? "Très bien"
          : finalAvg >= 14 ? "Bien"
          : finalAvg >= 12 ? "Assez bien"
          : finalAvg >= 10 ? "Passable"
          : "Insuffisant",
      });
    }

    let totalCoeffs = 0;
    let weightedSum = 0;
    let absentCount = 0;

    for (const sb of subjectsData) {
      if (sb.absent) {
        absentCount++;
        if (includeAbsentCoeff) {
          totalCoeffs += sb.coefficient;
        }
      } else {
        totalCoeffs += sb.coefficient;
        weightedSum += sb.finalAverage! * sb.coefficient;
      }
    }

    const generalAverage = totalCoeffs > 0
      ? Math.round((weightedSum / totalCoeffs) * 100) / 100
      : null;

    const mention = generalAverage === null ? "—"
      : generalAverage >= 16 ? "Très bien"
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
      rank: null,
      totalStudents: 0,
      mention,
      totalActiveCoeffs: totalCoeffs,
      weightedSum,
      absentCount,
    });
  }

  const ranked = bulletins.filter(b => b.generalAverage !== null);
  ranked.sort((a, b) => b.generalAverage! - a.generalAverage!);
  const totalRanked = ranked.length;
  ranked.forEach((b, i) => { b.rank = i + 1; b.totalStudents = totalRanked; });

  return {
    className: classRow[0].name,
    trimester,
    students: bulletins,
    subjectCount: subjectIds.length,
    studentCount: bulletins.length,
  };
}

// ─── Bulletin Annuel ───────────────────────────────────────────

export interface AnnualSubjectRow {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  trimesterAverages: Record<number, number | null>;
  annualAverage: number | null;
  points: number | null;
}

export interface AnnualStudentResult {
  studentId: string;
  firstName: string;
  lastName: string;
  subjects: AnnualSubjectRow[];
  annualGeneralAverage: number | null;
  annualRank: number | null;
  totalStudents: number;
  totalPoints: number;
  totalCoeffs: number;
  admis: boolean;
}

export interface AnnualBulletinData {
  className: string;
  academicYearId: number;
  trimesters: number[];
  students: AnnualStudentResult[];
  subjectCount: number;
  studentCount: number;
}

export async function computeAnnualBulletin(
  classId: number,
  academicYearId: number,
  trimesters: number[],
): Promise<AnnualBulletinData> {
  if (!trimesters.includes(1) || !trimesters.includes(2)) {
    throw new Error("Le bulletin annuel nécessite au moins les trimestres 1 et 2");
  }

  const classRow = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  if (!classRow[0]) throw new Error("Classe introuvable");

  const subjectRows = await db.select().from(subjects);
  const subjectMap = new Map(subjectRows.map(s => [s.id, s]));

  const classSubjectRows = await db.select().from(classSubjects)
    .where(and(eq(classSubjects.classId, classId)));
  const classSubjCoeff = new Map(classSubjectRows.map(cs => [cs.subjectId, cs.coefficient]));
  const subjectIds = classSubjectRows.map(cs => cs.subjectId);

  const studentRows = await db.select({
    id: students.id, firstName: students.firstName, lastName: students.lastName,
  }).from(students)
    .innerJoin(enrollments, and(
      eq(enrollments.studentId, students.id),
      eq(enrollments.classId, classId),
      eq(enrollments.academicYearId, academicYearId),
      eq(enrollments.status, "inscrit"),
    ))
    .orderBy(students.lastName, students.firstName);

  const trimesterBulletins: StudentBulletin[][] = [];
  for (const t of trimesters) {
    try {
      const bulletin = await computeClassBulletin(classId, t, academicYearId, false);
      trimesterBulletins.push(bulletin.students);
    } catch {
      trimesterBulletins.push([]);
    }
  }

  const studentMap = new Map<string, Map<number, Map<string, SubjectBulletin>>>();
  for (let i = 0; i < trimesters.length; i++) {
    const t = trimesters[i];
    for (const student of trimesterBulletins[i]) {
      if (!studentMap.has(student.studentId)) {
        studentMap.set(student.studentId, new Map());
      }
      const trimesterMap = studentMap.get(student.studentId)!;
      if (!trimesterMap.has(t)) {
        trimesterMap.set(t, new Map());
      }
      const subjMap = trimesterMap.get(t)!;
      for (const subj of student.subjects) {
        subjMap.set(subj.subjectId, subj);
      }
    }
  }

  const results: AnnualStudentResult[] = [];

  for (const student of studentRows) {
    const sid = String(student.id);
    const trimesterData = studentMap.get(sid);
    if (!trimesterData) continue;

    const subjects: AnnualSubjectRow[] = [];
    let totalPoints = 0;
    let totalCoeffs = 0;

    for (const subjId of subjectIds) {
      const subj = subjectMap.get(subjId);
      if (!subj) continue;
      const coeff = classSubjCoeff.get(subjId) ?? subj.coefficient ?? 1;

      const trimesterAverages: Record<number, number | null> = {};
      let sumAvgs = 0;
      let countAvgs = 0;

      for (const t of trimesters) {
        const subjData = trimesterData.get(t)?.get(String(subjId));
        const avg = subjData?.finalAverage ?? null;
        trimesterAverages[t] = avg;
        if (avg !== null && !subjData?.absent) {
          sumAvgs += avg;
          countAvgs++;
        }
      }

      const annualAverage = countAvgs > 0
        ? Math.round((sumAvgs / countAvgs) * 100) / 100
        : null;

      const points = annualAverage !== null
        ? Math.round(annualAverage * coeff * 100) / 100
        : null;

      if (points !== null) {
        totalPoints += points;
        totalCoeffs += coeff;
      }

      subjects.push({
        subjectId: String(subjId),
        subjectName: subj.name,
        coefficient: coeff,
        trimesterAverages,
        annualAverage,
        points,
      });
    }

    const annualGeneralAverage = totalCoeffs > 0
      ? Math.round((totalPoints / totalCoeffs) * 100) / 100
      : null;

    const admis = annualGeneralAverage !== null && annualGeneralAverage >= 10;

    results.push({
      studentId: sid,
      firstName: student.firstName,
      lastName: student.lastName,
      subjects,
      annualGeneralAverage,
      annualRank: null,
      totalStudents: 0,
      totalPoints: Math.round(totalPoints * 100) / 100,
      totalCoeffs,
      admis,
    });
  }

  const ranked = results.filter(r => r.annualGeneralAverage !== null);
  ranked.sort((a, b) => b.annualGeneralAverage! - a.annualGeneralAverage!);
  ranked.forEach((r, i) => { r.annualRank = i + 1; r.totalStudents = ranked.length; });

  return {
    className: classRow[0].name,
    academicYearId,
    trimesters,
    students: results,
    subjectCount: subjectIds.length,
    studentCount: results.length,
  };
}
