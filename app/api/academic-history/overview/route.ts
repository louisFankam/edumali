import { NextRequest, NextResponse } from "next/server";
import { computeClassBulletin } from "@/lib/services/bulletin.service";
import { db } from "@/lib/db";
import { subjects } from "@/lib/models/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") ? Number(searchParams.get("classId")) : undefined;
    const academicYearId = searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : undefined;
    const trimester = searchParams.get("trimester") ? Number(searchParams.get("trimester")) : undefined;

    if (!classId || !academicYearId) {
      return NextResponse.json({ ok: false, message: "classId et academicYearId requis" }, { status: 400 });
    }

    const t = trimester ?? 1;

    let bulletinData;
    try {
      bulletinData = await computeClassBulletin(classId, t, academicYearId, false);
    } catch {
      return NextResponse.json({
        ok: true,
        data: {
          stats: { totalStudents: 0, averageGrade: null, passRate: 0, studentsFollowed: 0 },
          students: [],
          distribution: { excellent: 0, bien: 0, assezBien: 0, passable: 0, insuffisant: 0 },
          topSubjects: [],
          weakSubjects: [],
          trimesterAverages: [null, null, null],
        },
      });
    }

    const studentsData = bulletinData.students;
    const totalStudents = studentsData.length;
    const studentsWithAvg = studentsData.filter(s => s.generalAverage !== null);
    const studentsFollowed = studentsWithAvg.length;
    const passed = studentsWithAvg.filter(s => s.generalAverage! >= 10).length;
    const passRate = studentsFollowed > 0 ? Math.round((passed / studentsFollowed) * 100) : 0;
    const sumAverages = studentsWithAvg.reduce((acc, s) => acc + s.generalAverage!, 0);
    const averageGrade = studentsFollowed > 0 ? Math.round((sumAverages / studentsFollowed) * 100) / 100 : null;

    const distribution = {
      excellent: studentsWithAvg.filter(s => s.generalAverage! >= 16).length,
      bien: studentsWithAvg.filter(s => s.generalAverage! >= 14 && s.generalAverage! < 16).length,
      assezBien: studentsWithAvg.filter(s => s.generalAverage! >= 12 && s.generalAverage! < 14).length,
      passable: studentsWithAvg.filter(s => s.generalAverage! >= 10 && s.generalAverage! < 12).length,
      insuffisant: studentsWithAvg.filter(s => s.generalAverage! < 10).length,
    };

    const students = studentsData.map(s => ({
      id: Number(s.studentId),
      studentName: `${s.firstName} ${s.lastName}`,
      studentId: s.studentId,
      class: bulletinData.className,
      trimester: `${t}e Trimestre`,
      trimesterNum: t,
      averageGrade: s.generalAverage !== null ? `${s.generalAverage}/20` : "—",
      numericAverage: s.generalAverage,
      rank: s.rank !== null ? `${s.rank}/${totalStudents}` : "—",
      status: s.generalAverage !== null ? (s.generalAverage >= 10 ? "Admis" : "Redoublant") : "En cours",
      subjects: s.subjects.map(sub => ({
        name: sub.subjectName,
        grade: sub.finalAverage !== null ? `${sub.finalAverage}/20` : "—",
        coefficient: sub.coefficient,
        finalAverage: sub.finalAverage,
        teacher: "",
      })),
      attendance: "—",
      behavior: "—",
      teacherComments: s.mention ? `Mention: ${s.mention}` : "",
    }));

    const subjectAverages: Record<number, { name: string; total: number; count: number }> = {};
    for (const s of studentsData) {
      for (const sub of s.subjects) {
        if (sub.finalAverage === null) continue;
        if (!subjectAverages[Number(sub.subjectId)]) {
          subjectAverages[Number(sub.subjectId)] = { name: sub.subjectName, total: 0, count: 0 };
        }
        subjectAverages[Number(sub.subjectId)].total += sub.finalAverage;
        subjectAverages[Number(sub.subjectId)].count += 1;
      }
    }

    const subjectEntries = Object.entries(subjectAverages)
      .map(([, v]) => ({ name: v.name, average: Math.round((v.total / v.count) * 100) / 100 }))
      .sort((a, b) => b.average - a.average);

    const topSubjects = subjectEntries.slice(0, 5);
    const weakSubjects = subjectEntries.slice(-5).reverse();

    const trimesterAverages: (number | null)[] = [null, null, null];
    trimesterAverages[t - 1] = averageGrade;

    return NextResponse.json({
      ok: true,
      data: {
        stats: {
          totalStudents,
          averageGrade: averageGrade !== null ? `${averageGrade}/20` : "—",
          numericAverage: averageGrade,
          passRate,
          studentsFollowed,
        },
        students,
        distribution,
        topSubjects,
        weakSubjects,
        trimesterAverages,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
