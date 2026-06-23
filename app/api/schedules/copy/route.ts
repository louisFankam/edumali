import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schedules } from "@/lib/models/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sourceClassId, targetClassId, academicYearId, overwrite } = body;

    if (!sourceClassId || !targetClassId || !academicYearId) {
      return NextResponse.json({ ok: false, message: "sourceClassId, targetClassId et academicYearId requis" }, { status: 400 });
    }

    if (overwrite) {
      await db.delete(schedules).where(
        and(eq(schedules.classId, Number(targetClassId)), eq(schedules.academicYearId, Number(academicYearId)))
      );
    }

    const sourceSlots = await db.select().from(schedules).where(
      and(eq(schedules.classId, Number(sourceClassId)), eq(schedules.academicYearId, Number(academicYearId)))
    );

    if (sourceSlots.length === 0) {
      return NextResponse.json({ ok: false, message: "Aucun créneau trouvé dans la classe source" }, { status: 404 });
    }

    const values = sourceSlots.map(s => ({
      classId: Number(targetClassId),
      academicYearId: Number(academicYearId),
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      subjectId: s.subjectId,
      teacherId: s.teacherId,
    }));

    await db.insert(schedules).values(values).returning();

    return NextResponse.json({ ok: true, count: values.length });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
