import { NextRequest, NextResponse } from "next/server";
import { getFamilyInfo, saveFamilyInfo } from "@/lib/services/family.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const studentId = new URL(req.url).searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ ok: false, message: "studentId requis" }, { status: 400 });
    const data = await getFamilyInfo(studentId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.studentId) return NextResponse.json({ ok: false, message: "studentId requis" }, { status: 400 });
    const data = await saveFamilyInfo(body.studentId, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
