import { db } from "@/lib/db";
import { auditLog } from "@/lib/models/schema";
import { and, desc, gte, lte, eq, count } from "drizzle-orm";

export async function logAudit(input: {
  tableName: string;
  recordId: number;
  action: "create" | "update" | "delete";
  userId?: number;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLog).values({
      tableName: input.tableName,
      recordId: input.recordId,
      action: input.action,
      userId: input.userId,
      oldValues: input.oldValues ? JSON.stringify(input.oldValues) : null,
      newValues: input.newValues ? JSON.stringify(input.newValues) : null,
    });
  } catch (err) {
    console.error("[Audit] Failed to log:", err);
  }
}

export interface AuditLogEntry {
  id: number;
  tableName: string;
  recordId: number;
  action: string;
  userId: number | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  createdAt: string;
}

export async function getAuditLogs(filters: {
  tableName?: string;
  action?: string;
  userId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: AuditLogEntry[]; total: number }> {
  const { tableName, action: filterAction, userId, from, to, page = 1, limit = 50 } = filters;
  const conditions: ReturnType<typeof eq>[] = [];

  if (tableName) conditions.push(eq(auditLog.tableName, tableName));
  if (filterAction) conditions.push(eq(auditLog.action, filterAction));
  if (userId) conditions.push(eq(auditLog.userId, userId));
  if (from) {
    const fromTs = Math.floor(new Date(from).getTime() / 1000);
    conditions.push(gte(auditLog.createdAt, fromTs));
  }
  if (to) {
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);
    const toTs = Math.floor(toEnd.getTime() / 1000);
    conditions.push(lte(auditLog.createdAt, toTs));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRows] = await db.select({ value: count() }).from(auditLog).where(where);
  const total = totalRows?.value ?? 0;

  const rows = await db
    .select()
    .from(auditLog)
    .where(where)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const data: AuditLogEntry[] = rows.map((r) => ({
    id: r.id,
    tableName: r.tableName,
    recordId: r.recordId,
    action: r.action,
    userId: r.userId,
    oldValues: r.oldValues ? parseJsonSafe(r.oldValues) : null,
    newValues: r.newValues ? parseJsonSafe(r.newValues) : null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));

  return { data, total };
}

function parseJsonSafe(val: string): Record<string, unknown> | null {
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}
