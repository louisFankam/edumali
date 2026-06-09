import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getStudents, addStudent, getStudentStats } from "@/lib/services/student.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const classId = searchParams.get("classId") ?? undefined;
    const academicYearId = searchParams.get("academicYearId") ?? undefined;
    const stats = searchParams.get("stats") === "true";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    if (stats) {
      const data = await getStudentStats(academicYearId);
      return NextResponse.json({ ok: true, data });
    }

    const result = await getStudents({ search, classId, academicYearId, page, limit });
    return NextResponse.json({
      ok: true,
      data: result.data,
      pagination: result.total ? { total: result.total, page: page ?? 1, limit: limit ?? result.data.length } : undefined,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = await getSessionUserId();
    const student = await addStudent(body, userId);
    return NextResponse.json({ ok: true, data: student }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
