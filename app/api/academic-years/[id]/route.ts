import { NextResponse } from "next/server";
import { fetchAcademicYear, editAcademicYear, removeAcademicYear } from "@/lib/services/settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await fetchAcademicYear(params.id);
    if (!data) return NextResponse.json({ ok: false, message: "Année non trouvée" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const data = await editAcademicYear(params.id, body);
    if (!data) return NextResponse.json({ ok: false, message: "Année non trouvée" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await removeAcademicYear(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
