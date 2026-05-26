import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exams } from "@/lib/models/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const yearId = searchParams.get("academicYearId");
    const trimester = searchParams.get("trimester");
    const where = and(
      classId ? eq(exams.classId, Number(classId)) : undefined,
      yearId ? eq(exams.academicYearId, Number(yearId)) : undefined,
      trimester ? eq(exams.trimester, Number(trimester)) : undefined,
    );
    const data = await db.select().from(exams).where(where).orderBy(exams.date, exams.startTime);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await db.insert(exams).values({
      classId: body.classId,
      academicYearId: body.academicYearId,
      subjectId: body.subjectId,
      teacherId: body.teacherId ?? null,
      trimester: body.trimester,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      room: body.room ?? "",
      status: body.status ?? "draft",
    }).returning();
    return NextResponse.json({ ok: true, data: data[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
