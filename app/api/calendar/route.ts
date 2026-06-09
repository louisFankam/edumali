import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getEventsByRange, createEvent } from "@/lib/services/calendar.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!from || !to) {
      return NextResponse.json({ ok: false, message: "Paramètres from et to requis" }, { status: 400 });
    }
    const data = await getEventsByRange(from, to);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.startDate || !body.type) {
      return NextResponse.json({ ok: false, message: "Titre, date et type requis" }, { status: 400 });
    }
    const userId = await getSessionUserId();
    const data = await createEvent(body, userId);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
