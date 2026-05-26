import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exams } from "@/lib/models/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await db.update(exams)
      .set({
        subjectId: body.subjectId,
        teacherId: body.teacherId ?? null,
        trimester: body.trimester,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        room: body.room ?? "",
        status: body.status ?? "draft",
        updatedAt: new Date(),
      })
      .where(eq(exams.id, Number(id)))
      .returning();
    return NextResponse.json({ ok: true, data: data[0] });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(exams).where(eq(exams.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
