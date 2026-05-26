import { NextRequest, NextResponse } from "next/server";
import { getEvaluations, addEvaluation } from "@/lib/services/evaluation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      classId: searchParams.get("classId") ? Number(searchParams.get("classId")) : undefined,
      subjectId: searchParams.get("subjectId") ? Number(searchParams.get("subjectId")) : undefined,
      trimester: searchParams.get("trimester") ? Number(searchParams.get("trimester")) : undefined,
      academicYearId: searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : undefined,
      status: searchParams.get("status") || undefined,
      type: searchParams.get("type") || undefined,
    };
    const data = await getEvaluations(filters);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.type || !body.classId || !body.subjectId || !body.trimester || !body.academicYearId || !body.date) {
      return NextResponse.json({ ok: false, message: "Champs obligatoires manquants" }, { status: 400 });
    }
    const data = await addEvaluation(body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
