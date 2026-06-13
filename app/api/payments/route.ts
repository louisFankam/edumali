import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getPayments, addPayment, getPaymentStatsService } from "@/lib/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const classId = searchParams.get("classId");
    const stats = searchParams.get("stats");
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    if (stats === "true") {
      const data = await getPaymentStatsService(from ?? undefined, to ?? undefined);
      return NextResponse.json({ ok: true, data });
    }

    const result = await getPayments({
      studentId: studentId ?? undefined,
      from: from ?? undefined,
      to: to ?? undefined,
      classId: classId ?? undefined,
      page, limit,
    });
    return NextResponse.json({
      ok: true,
      data: result.data,
      pagination: { total: result.total, page: page ?? 1, limit: limit ?? result.data.length },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = await getSessionUserId();
    const data = await addPayment(body, userId);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
