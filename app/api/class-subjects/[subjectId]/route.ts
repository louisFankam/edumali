import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { removeSubject } from "@/lib/services/class-subject.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    const { subjectId } = await params;
    const classId = new URL(req.url).searchParams.get("classId");
    if (!classId) return NextResponse.json({ ok: false, message: "classId requis" }, { status: 400 });
    const userId = await getSessionUserId();
    await removeSubject(classId, subjectId, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
