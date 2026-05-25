import { NextResponse } from "next/server";
import { fetchSubject, editSubject, removeSubject } from "@/lib/services/settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await fetchSubject(params.id);
    if (!data) return NextResponse.json({ ok: false, message: "Matière non trouvée" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const data = await editSubject(params.id, body);
    if (!data) return NextResponse.json({ ok: false, message: "Matière non trouvée" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await removeSubject(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
