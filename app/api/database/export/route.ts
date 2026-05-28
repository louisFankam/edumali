import { NextResponse } from "next/server";
import fs from "fs";
import { databasePath, rawDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeAudit = searchParams.get("excludeAudit") === "true";

    if (excludeAudit) {
      const tempDir = require("os").tmpdir();
      const tempPath = `${tempDir}/edumali-export-${Date.now()}.db`;
      fs.copyFileSync(databasePath, tempPath);
      const sqlite = require("better-sqlite3");
      const tempDb = new sqlite(tempPath);
      tempDb.prepare("DELETE FROM audit_log").run();
      tempDb.prepare("VACUUM").run();
      tempDb.close();
      const buffer = fs.readFileSync(tempPath);
      fs.unlinkSync(tempPath);
      const filename = `edumali-data-${new Date().toISOString().slice(0, 10)}.db`;
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const buffer = fs.readFileSync(databasePath);
    const filename = `edumali-data-${new Date().toISOString().slice(0, 10)}.db`;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
