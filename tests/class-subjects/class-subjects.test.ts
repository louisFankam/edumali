import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { sql } from "drizzle-orm";

describe("Class-Subjects - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait lister les matières d'une classe (vide initialement)", async () => {
    const { getClassSubjects } = await import("@/lib/services/class-subject.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];

    const subjects = await getClassSubjects(String(cls.id));
    expect(Array.isArray(subjects)).toBe(true);
  });

  it("devrait assigner des matières à une classe", async () => {
    const { saveClassSubjects, getClassSubjects } = await import("@/lib/services/class-subject.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const allSubjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];

    const result = await saveClassSubjects(String(cls.id), [
      { subjectId: allSubjects[0].id, coefficient: 3 },
      { subjectId: allSubjects[1].id, coefficient: 2 },
    ]);
    expect(result.ok).toBe(true);

    const assigned = await getClassSubjects(String(cls.id));
    expect(assigned.length).toBe(2);
    expect(assigned[0]).toHaveProperty("coefficient");
    expect(assigned[0]).toHaveProperty("subjectName");
  });

  it("devrait remplacer les assignations existantes", async () => {
    const { saveClassSubjects, getClassSubjects } = await import("@/lib/services/class-subject.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [subject] = db.all(sql`SELECT id FROM subjects LIMIT 1`) as { id: number }[];

    await saveClassSubjects(String(cls.id), [{ subjectId: subject.id, coefficient: 5 }]);
    const assigned = await getClassSubjects(String(cls.id));
    expect(assigned.length).toBe(1);
    expect(assigned[0].coefficient).toBe(5);
  });

  it("devrait retirer une matière d'une classe", async () => {
    const { saveClassSubjects, removeSubject, getClassSubjects } = await import("@/lib/services/class-subject.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [s1, s2] = db.all(sql`SELECT id FROM subjects LIMIT 2`) as { id: number }[];

    await saveClassSubjects(String(cls.id), [
      { subjectId: s1.id, coefficient: 2 },
      { subjectId: s2.id, coefficient: 3 },
    ]);

    await removeSubject(String(cls.id), String(s1.id));
    const assigned = await getClassSubjects(String(cls.id));
    expect(assigned.length).toBe(1);
    expect(assigned[0].subjectId).toBe(String(s2.id));
  });
});
