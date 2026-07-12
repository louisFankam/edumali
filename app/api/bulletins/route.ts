import { NextRequest, NextResponse } from "next/server";
import { computeClassBulletin, computeAnnualBulletin } from "@/lib/services/bulletin.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") ? Number(searchParams.get("classId")) : undefined;
    const trimester = searchParams.get("trimester") ? Number(searchParams.get("trimester")) : undefined;
    const academicYearId = searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : undefined;
    const includeAbsentCoeff = searchParams.get("includeAbsentCoeff") === "true";
    const annual = searchParams.get("annual") === "true";

    if (!classId || !academicYearId) {
      return NextResponse.json({ ok: false, message: "classId et academicYearId requis" }, { status: 400 });
    }

    if (annual) {
      const trimestersParam = searchParams.get("trimesters") || "1,2,3";
      const trimesters = trimestersParam.split(",").map(Number);
      const data = await computeAnnualBulletin(classId, academicYearId, trimesters);
      return NextResponse.json({ ok: true, data });
    }

    if (!trimester) {
      return NextResponse.json({ ok: false, message: "trimester requis" }, { status: 400 });
    }

    const data = await computeClassBulletin(classId, trimester, academicYearId, includeAbsentCoeff);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
