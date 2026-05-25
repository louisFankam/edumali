import { db } from "@/lib/db";
import { auditLog } from "@/lib/models/schema";

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
