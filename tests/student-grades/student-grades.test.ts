import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { seedClass, seedStudent, seedSubject, seedAcademicYear, seedEnrollment } from "../helpers/seed";
import { sql } from "drizzle-orm";

describe("Student Grades - Academic History API", () => {
  let studentId: string;
  let failingStudentId: string;
  let classId: string;
  let subjectIds: string[];
  let academicYearId: string;

  beforeAll(async () => {
    await setupTestDatabase();
    classId = await seedClass({ name: "6e A Notes", level: 6, capacity: 40 });
    academicYearId = await seedAcademicYear({ name: "2025-2026", isCurrent: true });
    studentId = await seedStudent(classId, {
      firstName: "Notes", lastName: "Test",
      gender: "Masculin", parentName: "Parent Test", parentPhone: "70000000",
    });
    await seedEnrollment(studentId, classId, academicYearId);

    failingStudentId = await seedStudent(classId, {
      firstName: "Failing", lastName: "Student",
      gender: "Masculin", parentName: "Parent Fail", parentPhone: "70000001",
    });
    await seedEnrollment(failingStudentId, classId, academicYearId);

    subjectIds = [];
    for (const subj of [{ name: "Maths", coeff: 4 }, { name: "Français", coeff: 3 }, { name: "Sciences", coeff: 2 }]) {
      const sid = await seedSubject({ name: subj.name, coefficient: subj.coeff });
      subjectIds.push(sid);
      const { db } = await import("@/lib/db");
      db.run(sql`INSERT OR IGNORE INTO class_subjects (class_id, subject_id, coefficient) VALUES (${Number(classId)}, ${Number(sid)}, ${subj.coeff})`);
    }
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait retourner l'historique des notes avec les matières", async () => {
    const { db } = await import("@/lib/db");
    const { evaluations, grades } = await import("@/lib/models/schema");
    const { eq, and } = await import("drizzle-orm");

    const evalIds: number[] = [];
    for (let i = 0; i < subjectIds.length; i++) {
      const [ev] = await db.insert(evaluations).values({
        name: `Devoir T1 ${i}`,
        type: "devoir",
        classId: Number(classId),
        subjectId: Number(subjectIds[i]),
        trimester: 1,
        academicYearId: Number(academicYearId),
        date: "2025-10-15",
        status: "published",
      }).returning();
      evalIds.push(ev.id);
    }

    for (let i = 0; i < evalIds.length; i++) {
      await db.insert(grades).values({
        evaluationId: evalIds[i],
        studentId: Number(studentId),
        score: 12 + i * 2,
      });
      await db.insert(grades).values({
        evaluationId: evalIds[i],
        studentId: Number(failingStudentId),
        score: 5 + i,
      });
    }

    const [trimEval] = await db.insert(evaluations).values({
      name: "Trimestrielle T1",
      type: "trimestrielle",
      classId: Number(classId),
      subjectId: Number(subjectIds[0]),
      trimester: 1,
      academicYearId: Number(academicYearId),
      date: "2025-12-15",
      status: "published",
    }).returning();

    await db.insert(grades).values({
      evaluationId: trimEval.id,
      studentId: Number(studentId),
      score: 14,
    });
    await db.insert(grades).values({
      evaluationId: trimEval.id,
      studentId: Number(failingStudentId),
      score: 4,
    });

    const { GET } = await import("@/app/api/academic-history/student/[id]/route");
    const req = new Request(`http://localhost/api/academic-history/student/${studentId}`);
    const response = await GET(req, { params: Promise.resolve({ id: studentId }) });
    const json = await response.json();

    expect(json.ok).toBe(true);
    expect(json.data.academicHistory.length).toBeGreaterThan(0);

    const t1 = json.data.academicHistory.find((h: any) => h.trimester === 1);
    expect(t1).toBeDefined();
    expect(t1.year).toBe("2025-2026");
    expect(t1.class).toBe("6e A Notes");
    expect(t1.subjects.length).toBe(subjectIds.length);

    const maths = t1.subjects.find((s: any) => s.name === "Maths");
    expect(maths).toBeDefined();
    expect(maths.coefficient).toBe(4);
    expect(maths.devoirScores).toEqual([12]);
    expect(maths.trimestrielleScore).toBe(14);
    expect(maths.finalAverage).toBe(13);
  });

  it("devrait calculer la moyenne générale et le statut correctement", async () => {
    const { db } = await import("@/lib/db");
    const { evaluations, grades } = await import("@/lib/models/schema");
    const { eq, and } = await import("drizzle-orm");

    const existingEvals = await db.select().from(evaluations).where(
      and(eq(evaluations.academicYearId, Number(academicYearId)), eq(evaluations.trimester, 2))
    );
    if (existingEvals.length === 0) {
      for (let i = 0; i < subjectIds.length; i++) {
        const [ev] = await db.insert(evaluations).values({
          name: `Devoir T2 ${i}`,
          type: "devoir",
          classId: Number(classId),
          subjectId: Number(subjectIds[i]),
          trimester: 2,
          academicYearId: Number(academicYearId),
          date: "2026-02-15",
          status: "published",
        }).returning();
        await db.insert(grades).values({
          evaluationId: ev.id,
          studentId: Number(studentId),
          score: 8,
        });
      }
    }

    const { GET } = await import("@/app/api/academic-history/student/[id]/route");
    const req = new Request(`http://localhost/api/academic-history/student/${studentId}`);
    const response = await GET(req, { params: Promise.resolve({ id: studentId }) });
    const json = await response.json();

    const t1 = json.data.academicHistory.find((h: any) => h.trimester === 1);
    const t2 = json.data.academicHistory.find((h: any) => h.trimester === 2);

    expect(Number(t1.numericAverage)).toBeGreaterThanOrEqual(10);
    expect(t1.status).toBe("Admis");

    if (t2) {
      expect(Number(t2.numericAverage)).toBeLessThan(10);
      expect(t2.status).toBe("Redoublant");
    }
  });

  it("devrait retourner le dernier trimestre comme moyenne courante", async () => {
    const { GET } = await import("@/app/api/academic-history/student/[id]/route");
    const req = new Request(`http://localhost/api/academic-history/student/${studentId}`);
    const response = await GET(req, { params: Promise.resolve({ id: studentId }) });
    const json = await response.json();

    expect(json.data.currentAverage).not.toBeNull();
    const history = json.data.academicHistory;
    if (history.length > 0) {
      expect(json.data.currentAverage).toBe(history[0].numericAverage);
    }
  });

  it("devrait inclure les scores individuels dans la réponse", async () => {
    const { GET } = await import("@/app/api/academic-history/student/[id]/route");
    const req = new Request(`http://localhost/api/academic-history/student/${studentId}`);
    const response = await GET(req, { params: Promise.resolve({ id: studentId }) });
    const json = await response.json();

    const t1 = json.data.academicHistory.find((h: any) => h.trimester === 1);
    const maths = t1.subjects.find((s: any) => s.name === "Maths");

    expect(maths.devoirScores).toBeDefined();
    expect(Array.isArray(maths.devoirScores)).toBe(true);
    expect(maths.trimestrielleScore).not.toBeNull();
  });

  describe("Batch Academic Status - POST /api/students/academic-status", () => {
    it("devrait retourner une erreur pour une liste vide", async () => {
      const { POST } = await import("@/app/api/students/academic-status/route");
      const req = new Request("http://localhost/api/students/academic-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: [] }),
      });
      const response = await POST(req);
      const json = await response.json();
      expect(json.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it("devrait retourner Admis/Échoué pour chaque élève", async () => {
      const { POST } = await import("@/app/api/students/academic-status/route");
      const req = new Request("http://localhost/api/students/academic-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: [Number(studentId), Number(failingStudentId)] }),
      });
      const response = await POST(req);
      const json = await response.json();

      expect(json.ok).toBe(true);
      expect(json.data).toBeDefined();

      const passing = json.data[studentId];
      expect(passing).toBeDefined();
      expect(passing.status).toBe("Admis");
      expect(passing.average).not.toBeNull();
      expect(passing.yearName).toBe("2025-2026");
      expect(passing.url).toBe(`/students/eleves_pages/${studentId}`);

      const failing = json.data[failingStudentId];
      expect(failing).toBeDefined();
      expect(failing.status).toBe("Échoué");
      expect(failing.average).not.toBeNull();
    });
  });
});
