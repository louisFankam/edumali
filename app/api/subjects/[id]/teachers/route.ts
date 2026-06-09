import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getTeachers } from "@/lib/services/teacher.service";
import { updateSubjectTeachers } from "@/lib/services/settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: teachers } = await getTeachers({});
    return NextResponse.json({ ok: true, data: teachers, subjectId: id });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const teacherIds: string[] = body.teacherIds ?? [];
    const userId = await getSessionUserId();
    await updateSubjectTeachers(id, teacherIds, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
