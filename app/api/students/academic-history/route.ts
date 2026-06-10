import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { findUserById } from "@/lib/repositories/user.repository";
import { getAcademicHistories, addAcademicHistory } from "@/lib/services/academic-history.service";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireModifySession() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, message: "Non connecté" }, { status: 401 });
  const user = await findUserById(userId);
  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return NextResponse.json({ ok: false, message: "Accès refusé" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const studentId = new URL(req.url).searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ ok: false, message: "studentId requis" }, { status: 400 });
    const data = await getAcademicHistories(studentId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireModifySession();
    if (authError) return authError;

    const body = await req.json();
    if (!body.studentId) return NextResponse.json({ ok: false, message: "studentId requis" }, { status: 400 });
    if (!body.schoolName) return NextResponse.json({ ok: false, message: "schoolName requis" }, { status: 400 });
    const userId = await getSessionUserId();
    const data = await addAcademicHistory(body.studentId, body, userId);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
