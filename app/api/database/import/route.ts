import { NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import { databasePath, importDatabase } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, message: "Aucun fichier fourni" }, { status: 400 });
    }

    const tempPath = path.join(os.tmpdir(), `edumali-import-${Date.now()}.db`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempPath, buffer);

    const backupPath = importDatabase(tempPath);
    fs.unlinkSync(tempPath);

    return NextResponse.json({
      ok: true,
      message: "Base de données importée avec succès. Veuillez redémarrer l'application pour que les changements prennent effet.",
      backupPath,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
