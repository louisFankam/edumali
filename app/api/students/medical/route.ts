import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getMedicalInfo, saveMedicalInfo } from "@/lib/services/medical.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const studentId = new URL(req.url).searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ ok: false, message: "studentId requis" }, { status: 400 });
    const data = await getMedicalInfo(studentId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.studentId) return NextResponse.json({ ok: false, message: "studentId requis" }, { status: 400 });
    const userId = await getSessionUserId();
    const data = await saveMedicalInfo(body.studentId, body, userId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
