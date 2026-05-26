import { NextResponse } from "next/server";
import { getPayroll, addPayroll } from "@/lib/services/teacher.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId") ?? undefined;
    const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const data = await getPayroll({ teacherId, month, year, from, to });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payroll = await addPayroll(body);
    return NextResponse.json({ ok: true, data: payroll }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
