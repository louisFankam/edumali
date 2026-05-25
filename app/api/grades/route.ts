import { NextRequest, NextResponse } from "next/server";
import { getGrades, saveGrades, getGradeStats } from "@/lib/services/grade.service";
import { findAllStudents } from "@/lib/repositories/student.repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const evaluationId = searchParams.get("evaluationId");
    if (!evaluationId) {
      return NextResponse.json({ ok: false, message: "evaluationId requis" }, { status: 400 });
    }
    const [grades, stats] = await Promise.all([
      getGrades(evaluationId),
      getGradeStats(evaluationId),
    ]);
    return NextResponse.json({ ok: true, data: { grades, stats } });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.evaluationId || !Array.isArray(body.grades)) {
      return NextResponse.json({ ok: false, message: "evaluationId et grades requis" }, { status: 400 });
    }
    const data = await saveGrades(body.evaluationId, body.grades);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
