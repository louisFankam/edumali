import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getClassSubjects, saveClassSubjects } from "@/lib/services/class-subject.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const classId = new URL(req.url).searchParams.get("classId");
    if (!classId) return NextResponse.json({ ok: false, message: "classId requis" }, { status: 400 });
    const data = await getClassSubjects(classId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.classId || !Array.isArray(body.assignments)) {
      return NextResponse.json({ ok: false, message: "classId et assignments requis" }, { status: 400 });
    }
    const userId = await getSessionUserId();
    await saveClassSubjects(body.classId, body.assignments, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
