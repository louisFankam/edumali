import { db } from "@/lib/db";
import { closedPeriods } from "@/lib/models/schema";
import { eq, and, sql } from "drizzle-orm";
import { logAudit } from "@/lib/services/audit.service";

export async function checkPeriodClosed(date: string): Promise<boolean> {
  const [year, month] = date.split("-").map(Number);
  if (!year || !month) return false;
  const rows = await db.select({ id: closedPeriods.id })
    .from(closedPeriods)
    .where(and(eq(closedPeriods.year, year), eq(closedPeriods.month, month)))
    .limit(1);
  return rows.length > 0;
}

export async function getClosedPeriods() {
  const rows = await db.select()
    .from(closedPeriods)
    .orderBy(sql`${closedPeriods.year} DESC, ${closedPeriods.month} DESC`);
  return rows.map(r => ({
    id: String(r.id),
    month: r.month,
    year: r.year,
    closedAt: r.closedAt,
  }));
}

export async function closePeriod(month: number, year: number, userId?: number) {
  const existing = await db.select({ id: closedPeriods.id })
    .from(closedPeriods)
    .where(and(eq(closedPeriods.year, year), eq(closedPeriods.month, month)))
    .limit(1);
  if (existing.length > 0) {
    throw new Error(`La période ${month}/${year} est déjà clôturée`);
  }
  const [created] = await db.insert(closedPeriods).values({
    month, year, closedAt: new Date(),
  }).returning();
  logAudit({ tableName: "closed_periods", recordId: created.id, action: "create", userId, newValues: { month, year } as any });
  return { id: String(created.id), month: created.month, year: created.year };
}

export async function openPeriod(month: number, year: number, userId?: number) {
  logAudit({ tableName: "closed_periods", recordId: 0, action: "delete", userId, newValues: { month, year } as any });
  await db.delete(closedPeriods)
    .where(and(eq(closedPeriods.year, year), eq(closedPeriods.month, month)));
}
