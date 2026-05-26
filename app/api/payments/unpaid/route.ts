import { NextResponse } from "next/server";
import { getUnpaidStudents } from "@/lib/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") ?? undefined;
    const academicYearId = searchParams.get("academicYearId") ?? undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const result = await getUnpaidStudents({ classId, academicYearId, page, limit });
    return NextResponse.json({
      ok: true,
      data: result.data,
      pagination: { total: result.total, page: page ?? 1, limit: limit ?? result.data.length },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
