import { NextRequest, NextResponse } from "next/server";
import { editClass, removeClass } from "@/lib/services/student.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await editClass(id, {
      name: body.name,
      level: body.level ?? null,
      capacity: body.capacity ?? null,
      totalFee: body.totalFee ?? null,
      teacherId: body.teacherId ?? null,
      color: body.color,
      academicYear: body.academicYear,
      status: body.status,
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await removeClass(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
