import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getClosedPeriods, closePeriod, openPeriod } from "@/lib/services/period.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getClosedPeriods();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { month, year } = await req.json();
    if (!month || !year) {
      return NextResponse.json({ ok: false, message: "month et year requis" }, { status: 400 });
    }
    const userId = await getSessionUserId();
    const data = await closePeriod(Number(month), Number(year), userId);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    const msg = String(error);
    const status = msg.includes("déjà clôturée") ? 409 : 500;
    return NextResponse.json({ ok: false, message: msg }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    if (!month || !year) {
      return NextResponse.json({ ok: false, message: "month et year requis" }, { status: 400 });
    }
    const userId = await getSessionUserId();
    await openPeriod(Number(month), Number(year), userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
