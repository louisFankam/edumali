import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getEnrollments, addEnrollment, getEnrollmentStats } from "@/lib/services/enrollment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const academicYearId = searchParams.get("academicYearId");
    const stats = searchParams.get("stats");

    if (stats === "true") {
      const data = await getEnrollmentStats(academicYearId ?? undefined);
      return NextResponse.json({ ok: true, data });
    }

    const data = await getEnrollments({ studentId: studentId ?? undefined, academicYearId: academicYearId ?? undefined });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = await getSessionUserId();
    const data = await addEnrollment(body, userId);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
