import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getTeacherAttendance, getTeacherAttendanceByDate, saveTeacherAttendance } from "@/lib/services/teacher.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId") ?? undefined;
    const date = searchParams.get("date") ?? undefined;
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    if (date) {
      const data = await getTeacherAttendanceByDate(date);
      return NextResponse.json({ ok: true, data });
    }

    const data = await getTeacherAttendance(teacherId, from, to);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records } = body;
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ ok: false, message: "Aucune présence fournie" }, { status: 400 });
    }
    const userId = await getSessionUserId();
    await saveTeacherAttendance(records, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
