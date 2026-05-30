import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { sql } from "drizzle-orm";

describe("Academic History - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait retourner un historique vide pour un étudiant", async () => {
    const { getAcademicHistories } = await import("@/lib/services/academic-history.service");
    const { db } = await import("@/lib/db");
    const [student] = db.all(sql`SELECT id FROM students LIMIT 1`) as { id: number }[];

    const histories = await getAcademicHistories(String(student.id));
    expect(histories).toEqual([]);
  });

  it("devrait créer un historique académique", async () => {
    const { addAcademicHistory } = await import("@/lib/services/academic-history.service");
    const { db } = await import("@/lib/db");
    const [student] = db.all(sql`SELECT id FROM students LIMIT 1`) as { id: number }[];

    const created = await addAcademicHistory(String(student.id), {
      schoolName: "École Primaire ABC",
      className: "CM2",
      academicYear: "2024-2025",
      reason: "Passage en 6e",
      remarks: "Bon élève",
    });

    expect(created.schoolName).toBe("École Primaire ABC");
    expect(created.className).toBe("CM2");
    expect(created.studentId).toBe(String(student.id));
  });

  it("devrait lister les historiques d'un étudiant", async () => {
    const { getAcademicHistories } = await import("@/lib/services/academic-history.service");
    const { db } = await import("@/lib/db");
    const [student] = db.all(sql`SELECT id FROM students LIMIT 1`) as { id: number }[];

    const histories = await getAcademicHistories(String(student.id));
    expect(histories.length).toBeGreaterThanOrEqual(1);
  });

  it("devrait modifier un historique académique", async () => {
    const { addAcademicHistory, editAcademicHistory } = await import("@/lib/services/academic-history.service");
    const { db } = await import("@/lib/db");
    const [student] = db.all(sql`SELECT id FROM students LIMIT 1`) as { id: number }[];

    const created = await addAcademicHistory(String(student.id), {
      schoolName: "Ancienne école",
      className: "CE1",
      academicYear: "2023-2024",
    });

    const updated = await editAcademicHistory(created.id, {
      schoolName: "Nouvelle école",
      className: "CE2",
    });

    expect(updated.schoolName).toBe("Nouvelle école");
    expect(updated.className).toBe("CE2");
  });

  it("devrait supprimer un historique académique", async () => {
    const { addAcademicHistory, removeAcademicHistory, getAcademicHistories } = await import("@/lib/services/academic-history.service");
    const { db } = await import("@/lib/db");
    const [student] = db.all(sql`SELECT id FROM students LIMIT 1`) as { id: number }[];

    const created = await addAcademicHistory(String(student.id), {
      schoolName: "École temporaire",
      academicYear: "2022-2023",
    });

    await removeAcademicHistory(created.id);
    const histories = await getAcademicHistories(String(student.id));
    const found = histories.find(h => h.id === created.id);
    expect(found).toBeUndefined();
  });
});
