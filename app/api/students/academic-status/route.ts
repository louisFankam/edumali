import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, enrollments, classes, academicYears, evaluations, grades, subjects, classSubjects } from "@/lib/models/schema";
import { eq, and, sql, inArray, desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const studentIds: number[] = (body.studentIds || []).map(Number).filter(Boolean);
    if (studentIds.length === 0) {
      return NextResponse.json({ ok: false, message: "Aucun ID fourni" }, { status: 400 });
    }

    const enrollmentRows = await db.select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      classId: enrollments.classId,
      academicYearId: enrollments.academicYearId,
      className: classes.name,
      yearName: academicYears.name,
    }).from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .innerJoin(academicYears, eq(enrollments.academicYearId, academicYears.id))
      .where(inArray(enrollments.studentId, studentIds))
      .orderBy(desc(academicYears.name));

    const enrollmentByStudent = new Map<number, typeof enrollmentRows>();
    for (const enr of enrollmentRows) {
      if (!enrollmentByStudent.has(enr.studentId)) {
        enrollmentByStudent.set(enr.studentId, []);
      }
      enrollmentByStudent.get(enr.studentId)!.push(enr);
    }

    const result: Record<string, { status: string | null; average: number | null; yearName: string | null; studentId: string; url: string }> = {};

    for (const sid of studentIds) {
      const enrs = enrollmentByStudent.get(sid);
      if (!enrs || enrs.length === 0) {
        result[String(sid)] = { status: null, average: null, yearName: null, studentId: String(sid), url: `/students/eleves_pages/${sid}` };
        continue;
      }

      const latestEnr = enrs[0];
      const [yearRow] = await db.select().from(academicYears).where(eq(academicYears.id, latestEnr.academicYearId)).limit(1);

      let trimesterAverages: number[] = [];

      for (let trimester = 1; trimester <= 3; trimester++) {
        const evalRows = await db.select({
          id: evaluations.id,
          type: evaluations.type,
          subjectId: evaluations.subjectId,
          subjectName: subjects.name,
        }).from(evaluations)
          .innerJoin(subjects, eq(evaluations.subjectId, subjects.id))
          .where(and(
            eq(evaluations.classId, latestEnr.classId),
            eq(evaluations.academicYearId, latestEnr.academicYearId),
            eq(evaluations.trimester, trimester),
          ));

        if (evalRows.length === 0) continue;

        const subjectCoeffs = new Map<number, number>();
        const csRows = await db.select().from(classSubjects).where(eq(classSubjects.classId, latestEnr.classId));
        for (const cs of csRows) {
          subjectCoeffs.set(cs.subjectId, cs.coefficient);
        }

        const subjectData: Record<number, { devoirScores: number[]; trimestrielleScore: number | null; coeff: number }> = {};

        for (const ev of evalRows) {
          const gradeRows = await db.select().from(grades).where(and(
            eq(grades.evaluationId, ev.id),
            eq(grades.studentId, sid),
          ));

          for (const gr of gradeRows) {
            if (gr.isAbsent) continue;
            if (!subjectData[ev.subjectId]) {
              subjectData[ev.subjectId] = {
                devoirScores: [],
                trimestrielleScore: null,
                coeff: subjectCoeffs.get(ev.subjectId) ?? 1,
              };
            }
            if (ev.type === "devoir") {
              subjectData[ev.subjectId].devoirScores.push(gr.score);
            } else if (ev.type === "trimestrielle") {
              subjectData[ev.subjectId].trimestrielleScore = gr.score;
            }
          }
        }

        let totalCoeffs = 0;
        let weightedSum = 0;

        for (const [, sd] of Object.entries(subjectData)) {
          const devoirAvg = sd.devoirScores.length > 0
            ? sd.devoirScores.reduce((a, b) => a + b, 0) / sd.devoirScores.length : null;
          let finalAvg: number | null = null;
          if (devoirAvg !== null && sd.trimestrielleScore !== null) {
            finalAvg = devoirAvg * 0.5 + sd.trimestrielleScore * 0.5;
          } else if (devoirAvg !== null) {
            finalAvg = devoirAvg;
          } else if (sd.trimestrielleScore !== null) {
            finalAvg = sd.trimestrielleScore;
          }
          if (finalAvg !== null) {
            totalCoeffs += sd.coeff;
            weightedSum += finalAvg * sd.coeff;
          }
        }

        const trimesterAvg = totalCoeffs > 0 ? Math.round((weightedSum / totalCoeffs) * 100) / 100 : null;
        if (trimesterAvg !== null) {
          trimesterAverages.push(trimesterAvg);
        }
      }

      const annualAverage = trimesterAverages.length > 0
        ? Math.round(trimesterAverages.reduce((a, b) => a + b, 0) / trimesterAverages.length * 100) / 100
        : null;

      result[String(sid)] = {
        status: annualAverage !== null ? (annualAverage >= 10 ? "Admis" : "Échoué") : null,
        average: annualAverage,
        yearName: latestEnr.yearName,
        studentId: String(sid),
        url: `/students/eleves_pages/${sid}`,
      };
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
