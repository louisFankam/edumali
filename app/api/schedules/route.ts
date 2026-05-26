import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schedules } from "@/lib/models/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const yearId = searchParams.get("academicYearId");
    const where = and(
      classId ? eq(schedules.classId, Number(classId)) : undefined,
      yearId ? eq(schedules.academicYearId, Number(yearId)) : undefined,
    );
    const data = await db.select().from(schedules).where(where).orderBy(schedules.startTime, schedules.day);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await db.insert(schedules).values({
      classId: body.classId,
      academicYearId: body.academicYearId,
      day: body.day,
      startTime: body.startTime,
      endTime: body.endTime,
      subjectId: body.subjectId ?? null,
      teacherId: body.teacherId ?? null,
    }).returning();
    return NextResponse.json({ ok: true, data: data[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
