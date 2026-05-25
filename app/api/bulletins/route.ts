import { NextRequest, NextResponse } from "next/server";
import { computeClassBulletin } from "@/lib/services/bulletin.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") ? Number(searchParams.get("classId")) : undefined;
    const trimester = searchParams.get("trimester") ? Number(searchParams.get("trimester")) : undefined;
    const academicYearId = searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : undefined;

    if (!classId || !trimester || !academicYearId) {
      return NextResponse.json({ ok: false, message: "classId, trimester et academicYearId requis" }, { status: 400 });
    }

    const data = await computeClassBulletin(classId, trimester, academicYearId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
