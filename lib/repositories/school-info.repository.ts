import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { schoolInfo } from "@/lib/models/schema";

export async function getSchoolInfo() {
  const rows = await db.query.schoolInfo.findMany({ limit: 1 });
  return rows[0] ?? null;
}

export async function upsertSchoolInfo(input: {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  director?: string;
  logoUrl?: string;
  foundedYear?: number | null;
}) {
  const existing = await getSchoolInfo();
  if (existing) {
    const [updated] = await db
      .update(schoolInfo)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(schoolInfo.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db.insert(schoolInfo).values(input as any).returning();
  return created;
}
