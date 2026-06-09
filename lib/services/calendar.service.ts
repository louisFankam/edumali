import { db } from "@/lib/db";
import { schoolEvents } from "@/lib/models/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { logAudit } from "@/lib/services/audit.service";

export type SchoolEventType = "holiday" | "event" | "meeting" | "exam" | "deadline";

export interface SchoolEventData {
  id: string;
  title: string;
  description: string | null;
  type: SchoolEventType;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  color: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

function mapEvent(e: typeof schoolEvents.$inferSelect): SchoolEventData {
  return {
    id: String(e.id),
    title: e.title,
    description: e.description,
    type: e.type as SchoolEventType,
    startDate: e.startDate,
    endDate: e.endDate,
    startTime: e.startTime,
    endTime: e.endTime,
    allDay: e.allDay,
    color: e.color,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export async function getEventsByRange(from: string, to: string): Promise<SchoolEventData[]> {
  const rows = await db.select()
    .from(schoolEvents)
    .where(
      and(
        lte(schoolEvents.startDate, to),
        sql`COALESCE(${schoolEvents.endDate}, ${schoolEvents.startDate}) >= ${from}`,
      ),
    )
    .orderBy(schoolEvents.startDate);
  return rows.map(mapEvent);
}

export async function createEvent(data: {
  title: string;
  description?: string;
  type: SchoolEventType;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  color?: string;
}, userId?: number) {
  const [created] = await db.insert(schoolEvents).values({
    title: data.title,
    description: data.description ?? null,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate ?? null,
    startTime: data.startTime ?? null,
    endTime: data.endTime ?? null,
    allDay: data.allDay ?? true,
    color: data.color ?? null,
  }).returning();
  logAudit({ tableName: "school_events", recordId: created.id, action: "create", userId, newValues: data as any });
  return mapEvent(created);
}

export async function updateEvent(id: string, data: Partial<{
  title: string;
  description: string;
  type: SchoolEventType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color: string;
}>, userId?: number) {
  const values: Record<string, unknown> = {};
  if (data.title !== undefined) values.title = data.title;
  if (data.description !== undefined) values.description = data.description;
  if (data.type !== undefined) values.type = data.type;
  if (data.startDate !== undefined) values.startDate = data.startDate;
  if (data.endDate !== undefined) values.endDate = data.endDate;
  if (data.startTime !== undefined) values.startTime = data.startTime;
  if (data.endTime !== undefined) values.endTime = data.endTime;
  if (data.allDay !== undefined) values.allDay = data.allDay;
  if (data.color !== undefined) values.color = data.color;

  const [updated] = await db.update(schoolEvents)
    .set(values)
    .where(eq(schoolEvents.id, Number(id)))
    .returning();
  if (!updated) throw new Error("Événement non trouvé");
  logAudit({ tableName: "school_events", recordId: Number(id), action: "update", userId, newValues: data as any });
  return mapEvent(updated);
}

export async function deleteEvent(id: string, userId?: number) {
  logAudit({ tableName: "school_events", recordId: Number(id), action: "delete", userId });
  await db.delete(schoolEvents).where(eq(schoolEvents.id, Number(id)));
}

export async function getEventById(id: string): Promise<SchoolEventData | null> {
  const [row] = await db.select().from(schoolEvents).where(eq(schoolEvents.id, Number(id))).limit(1);
  return row ? mapEvent(row) : null;
}
