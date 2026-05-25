import { NextRequest, NextResponse } from "next/server";
import { getAcademicHistories, addAcademicHistory } from "@/lib/services/academic-history.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const studentId = new URL(req.url).searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ ok: false, message: "studentId requis" }, { status: 400 });
    const data = await getAcademicHistories(studentId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.studentId) return NextResponse.json({ ok: false, message: "studentId requis" }, { status: 400 });
    if (!body.schoolName) return NextResponse.json({ ok: false, message: "schoolName requis" }, { status: 400 });
    const data = await addAcademicHistory(body.studentId, body);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
