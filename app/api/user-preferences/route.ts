import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/models/schema";
import { getSessionUserId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaultPrefs = {
  theme: "light" as const,
  primaryColor: "#dc2626",
  secondaryColor: "#3b82f6",
  accentColor: "#10b981",
  sidebarColor: "#374151",
  sidebarTextColor: "#ffffff",
  borderRadius: "medium" as const,
  fontSize: "medium" as const,
  fontFamily: "Inter, sans-serif",
  denseMode: false,
  compactSidebar: false,
  animations: true,
  highContrast: false,
};

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Non authentifié" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, data: { userId, ...defaultPrefs } });
    }

    const row = rows[0];
    return NextResponse.json({
      ok: true,
      data: {
        userId: row.userId,
        theme: row.theme,
        primaryColor: row.primaryColor,
        secondaryColor: row.secondaryColor,
        accentColor: row.accentColor,
        sidebarColor: row.sidebarColor,
        sidebarTextColor: row.sidebarTextColor,
        borderRadius: row.borderRadius,
        fontSize: row.fontSize,
        fontFamily: row.fontFamily,
        denseMode: Boolean(row.denseMode),
        compactSidebar: Boolean(row.compactSidebar),
        animations: Boolean(row.animations),
        highContrast: Boolean(row.highContrast),
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    const data = {
      userId,
      theme: body.theme ?? defaultPrefs.theme,
      primaryColor: body.primaryColor ?? defaultPrefs.primaryColor,
      secondaryColor: body.secondaryColor ?? defaultPrefs.secondaryColor,
      accentColor: body.accentColor ?? defaultPrefs.accentColor,
      sidebarColor: body.sidebarColor ?? defaultPrefs.sidebarColor,
      sidebarTextColor: body.sidebarTextColor ?? defaultPrefs.sidebarTextColor,
      borderRadius: body.borderRadius ?? defaultPrefs.borderRadius,
      fontSize: body.fontSize ?? defaultPrefs.fontSize,
      fontFamily: body.fontFamily ?? defaultPrefs.fontFamily,
      denseMode: body.denseMode ?? defaultPrefs.denseMode,
      compactSidebar: body.compactSidebar ?? defaultPrefs.compactSidebar,
      animations: body.animations ?? defaultPrefs.animations,
      highContrast: body.highContrast ?? defaultPrefs.highContrast,
      updatedAt: new Date(),
    };

    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    if (existing.length > 0) {
      await db
        .update(userPreferences)
        .set(data)
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values(data);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
