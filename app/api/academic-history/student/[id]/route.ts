import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, enrollments, classes, academicYears, evaluations, grades, subjects, classSubjects } from "@/lib/models/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const studentId = Number(id);
    if (!studentId) {
      return NextResponse.json({ ok: false, message: "ID étudiant requis" }, { status: 400 });
    }

    const studentRow = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!studentRow[0]) {
      return NextResponse.json({ ok: false, message: "Étudiant introuvable" }, { status: 404 });
    }

    const enrollmentRows = await db.select({
      id: enrollments.id,
      classId: enrollments.classId,
      academicYearId: enrollments.academicYearId,
      status: enrollments.status,
      className: classes.name,
      yearName: academicYears.name,
    }).from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .innerJoin(academicYears, eq(enrollments.academicYearId, academicYears.id))
      .where(eq(enrollments.studentId, studentId))
      .orderBy(desc(academicYears.name));

    const academicHistory = [];
    const enrollmentMap = new Map<string, { classId: number; academicYearId: number; className: string; yearName: string }>();

    for (const enr of enrollmentRows) {
      const key = `${enr.classId}_${enr.academicYearId}`;
      enrollmentMap.set(key, { classId: enr.classId, academicYearId: enr.academicYearId, className: enr.className, yearName: enr.yearName });

      const subjectCoeffs = new Map<number, number>();
      const csRows = await db.select().from(classSubjects).where(eq(classSubjects.classId, enr.classId));
      for (const cs of csRows) {
        subjectCoeffs.set(cs.subjectId, cs.coefficient);
      }

      for (let trimester = 1; trimester <= 3; trimester++) {
        const evalRows = await db.select({
          id: evaluations.id,
          type: evaluations.type,
          subjectId: evaluations.subjectId,
          subjectName: subjects.name,
        }).from(evaluations)
          .innerJoin(subjects, eq(evaluations.subjectId, subjects.id))
          .where(and(
            eq(evaluations.classId, enr.classId),
            eq(evaluations.academicYearId, enr.academicYearId),
            eq(evaluations.trimester, trimester),
          ));

        if (evalRows.length === 0) continue;

        const subjectData: Record<number, { name: string; devoirScores: number[]; trimestrielleScore: number | null; coeff: number }> = {};

        for (const ev of evalRows) {
          const gradeRows = await db.select().from(grades).where(and(
            eq(grades.evaluationId, ev.id),
            eq(grades.studentId, studentId),
          ));

          for (const gr of gradeRows) {
            if (gr.isAbsent) continue;
            if (!subjectData[ev.subjectId]) {
              subjectData[ev.subjectId] = {
                name: ev.subjectName,
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
        const subjectsList: { name: string; grade: string; coefficient: number; finalAverage: number | null; devoirScores: number[]; trimestrielleScore: number | null }[] = [];

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
            finalAvg = Math.round(finalAvg * 100) / 100;
            totalCoeffs += sd.coeff;
            weightedSum += finalAvg * sd.coeff;
          }

          subjectsList.push({
            name: sd.name,
            grade: finalAvg !== null ? `${finalAvg}/20` : "—",
            coefficient: sd.coeff,
            finalAverage: finalAvg,
            devoirScores: sd.devoirScores,
            trimestrielleScore: sd.trimestrielleScore,
          });
        }

        const generalAverage = totalCoeffs > 0
          ? Math.round((weightedSum / totalCoeffs) * 100) / 100 : null;

        academicHistory.push({
          year: enr.yearName,
          class: enr.className,
          trimester,
          average: generalAverage !== null ? `${generalAverage}/20` : "—",
          numericAverage: generalAverage,
          status: generalAverage !== null ? (generalAverage >= 10 ? "Admis" : "Redoublant") : "En cours",
          subjects: subjectsList,
        });
      }
    }

    academicHistory.sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year);
      return b.trimester - a.trimester;
    });

    const subjectProgression: { subject: string; current: number | null; previous: number | null; trend: string }[] = [];
    if (academicHistory.length >= 2) {
      const current = academicHistory[0];
      const previous = academicHistory[1];
      const allSubjects = new Set<string>();
      for (const s of current.subjects) allSubjects.add(s.name);
      for (const s of previous.subjects) allSubjects.add(s.name);

      for (const subjName of allSubjects) {
        const curr = current.subjects.find(s => s.name === subjName)?.finalAverage ?? null;
        const prev = previous.subjects.find(s => s.name === subjName)?.finalAverage ?? null;

        let trend = "stable";
        if (curr !== null && prev !== null) {
          if (curr > prev) trend = "up";
          else if (curr < prev) trend = "down";
        }

        subjectProgression.push({ subject: subjName, current: curr, previous: prev, trend });
      }
    }

    const yearProgression = academicHistory
      .filter(a => a.numericAverage !== null)
      .map(a => ({ year: a.year, trimester: a.trimester, average: a.numericAverage! }));

    return NextResponse.json({
      ok: true,
      data: {
        student: {
          id: studentRow[0].id,
          firstName: studentRow[0].firstName,
          lastName: studentRow[0].lastName,
        },
        academicHistory,
        subjectProgression,
        yearProgression,
        currentAverage: academicHistory[0]?.numericAverage ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
