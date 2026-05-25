import { NextRequest, NextResponse } from "next/server";
import { getPayments, addPayment, getPaymentStatsService } from "@/lib/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const stats = searchParams.get("stats");

    if (stats === "true") {
      const data = await getPaymentStatsService(from ?? undefined, to ?? undefined);
      return NextResponse.json({ ok: true, data });
    }

    const data = await getPayments({ studentId: studentId ?? undefined, from: from ?? undefined, to: to ?? undefined });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await addPayment(body);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
