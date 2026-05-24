import { NextResponse } from "next/server";
import { getStudents, addStudent, getStudentStats } from "@/lib/services/student.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const classId = searchParams.get("classId") ?? undefined;
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const data = await getStudentStats();
      return NextResponse.json({ ok: true, data });
    }

    const data = await getStudents({ search, classId });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const student = await addStudent(body);
    return NextResponse.json({ ok: true, data: student }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
