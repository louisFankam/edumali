import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getClasses, addClass } from "@/lib/services/student.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getClasses();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = await getSessionUserId();
    const data = await addClass({
      name: body.name,
      level: body.level ?? null,
      capacity: body.capacity ?? null,
      totalFee: body.totalFee ?? null,
      teacherId: body.teacherId ?? null,
      color: body.color,
      academicYear: body.academicYear,
      status: body.status,
      feeTypeItems: body.feeTypeItems,
    }, userId);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
