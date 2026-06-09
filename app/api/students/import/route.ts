import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { parseFile, importStudents } from "@/lib/services/import.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "execute") {
      const body = await request.json();
      const userId = await getSessionUserId();
      const result = await importStudents(body.rows, userId);
      return NextResponse.json({ ok: true, data: result });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, message: "Aucun fichier fourni" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { rows } = await parseFile(buffer);
    return NextResponse.json({ ok: true, data: rows });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
