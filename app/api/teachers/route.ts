import { NextResponse } from "next/server";
import { getTeachers, addTeacher, getTeacherStats } from "@/lib/services/teacher.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const contrat = searchParams.get("contrat") ?? undefined;
    const stats = searchParams.get("stats") === "true";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    if (stats) {
      const data = await getTeacherStats();
      return NextResponse.json({ ok: true, data });
    }

    const result = await getTeachers({ search, status, contrat, page, limit });
    return NextResponse.json({
      ok: true,
      data: result.data,
      pagination: { total: result.total, page: page ?? 1, limit: limit ?? result.data.length },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const teacher = await addTeacher(body);
    return NextResponse.json({ ok: true, data: teacher }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
