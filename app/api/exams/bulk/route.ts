import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exams as examsTable } from "@/lib/models/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { classId, academicYearId, trimester, subjectIds, startDate, daysGap = 1, startTime = "08:00", endTime = "10:00", room = "" } = body;

    if (!classId || !academicYearId || !trimester || !subjectIds?.length || !startDate) {
      return NextResponse.json({ ok: false, message: "classId, academicYearId, trimester, subjectIds et startDate requis" }, { status: 400 });
    }

    const values = subjectIds.map((subjectId: number, i: number) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * daysGap);
      return {
        classId: Number(classId),
        academicYearId: Number(academicYearId),
        subjectId: Number(subjectId),
        teacherId: null as number | null,
        trimester: Number(trimester),
        date: date.toISOString().slice(0, 10),
        startTime,
        endTime,
        room: room || "",
        status: "draft",
      };
    });

    const inserted = await db.insert(examsTable).values(values).returning();

    return NextResponse.json({ ok: true, count: inserted.length, data: inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
