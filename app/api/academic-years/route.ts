import { NextResponse } from "next/server";
import { fetchAcademicYears, fetchCurrentAcademicYear, addAcademicYear } from "@/lib/services/settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("current") === "true") {
      const data = await fetchCurrentAcademicYear();
      return NextResponse.json({ ok: true, data });
    }
    const data = await fetchAcademicYears();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await addAcademicYear(body);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
