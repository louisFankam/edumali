import { NextRequest, NextResponse } from "next/server";
import { getAttendanceByDateAndClass, saveAttendance, getAttendanceStats, getAttendanceByRange } from "@/lib/services/attendance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const stats = searchParams.get("stats");

    if (stats === "true") {
      const data = await getAttendanceStats(studentId ?? undefined, classId ?? undefined, from ?? undefined, to ?? undefined);
      return NextResponse.json({ ok: true, data });
    }

    if (date) {
      const data = await getAttendanceByDateAndClass(date, classId ?? undefined);
      let result = data;
      if (from) result = result.filter(a => a.date >= from);
      if (to) result = result.filter(a => a.date <= to);
      return NextResponse.json({ ok: true, data: result });
    }

    if (from && to) {
      const data = await getAttendanceByRange(from, to, classId ?? undefined);
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json({ ok: false, message: "Paramètre 'date' ou plage 'from/to' requis" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await saveAttendance(body.records);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
