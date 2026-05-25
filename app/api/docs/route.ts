import { NextResponse } from "next/server";
import { openapi } from "@/lib/api/openapi";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(openapi);
}
