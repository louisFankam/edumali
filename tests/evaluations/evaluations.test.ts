import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { sql } from "drizzle-orm";

describe("Évaluations & Notes - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait lister les évaluations", async () => {
    const { getEvaluations } = await import("@/lib/services/evaluation.service");
    const evals = await getEvaluations();
    expect(Array.isArray(evals)).toBe(true);
  });

  it("devrait créer une évaluation", async () => {
    const { addEvaluation } = await import("@/lib/services/evaluation.service");
    const { db } = await import("@/lib/db");

    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    const created = await addEvaluation({
      name: "Devoir de contrôle",
      type: "devoir",
      classId: cls.id,
      subjectId: subjects[0].id,
      trimester: 1,
      academicYearId: year.id,
      date: "2026-05-20",
    });

    expect(created.id).toBeTruthy();
  });

  it("devrait filtrer les évaluations par classe", async () => {
    const { getEvaluations } = await import("@/lib/services/evaluation.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];

    const evals = await getEvaluations({ classId: cls.id });
    evals.forEach(e => {
      expect(e.classId).toBe(String(cls.id));
    });
  });

  it("devrait modifier une évaluation", async () => {
    const { addEvaluation, editEvaluation, getEvaluationById } = await import("@/lib/services/evaluation.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    const created = await addEvaluation({
      name: "Avant modif",
      type: "devoir",
      classId: cls.id,
      subjectId: subjects[3 % subjects.length].id,
      trimester: 1,
      academicYearId: year.id,
      date: "2026-05-20",
    });

    await editEvaluation(created.id, { name: "Après modif", status: "published" });
    const updated = await getEvaluationById(created.id);
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("Après modif");
    expect(updated!.status).toBe("published");
  });

  it("devrait supprimer une évaluation", async () => {
    const { addEvaluation, removeEvaluation, getEvaluationById } = await import("@/lib/services/evaluation.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    const created = await addEvaluation({
      name: "À supprimer",
      type: "devoir",
      classId: cls.id,
      subjectId: subjects[4 % subjects.length].id,
      trimester: 1,
      academicYearId: year.id,
      date: "2026-06-01",
    });

    await removeEvaluation(created.id);
    const found = await getEvaluationById(created.id);
    expect(found).toBeNull();
  });

  it("devrait récupérer une évaluation par ID", async () => {
    const { addEvaluation, getEvaluationById } = await import("@/lib/services/evaluation.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    const created = await addEvaluation({
      name: "Évaluation spécifique",
      type: "trimestrielle",
      classId: cls.id,
      subjectId: subjects[0].id,
      trimester: 2,
      academicYearId: year.id,
      date: "2026-06-15",
    });

    const found = await getEvaluationById(created.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Évaluation spécifique");
  });

  it("devrait retourner null pour une évaluation inexistante", async () => {
    const { getEvaluationById } = await import("@/lib/services/evaluation.service");
    const found = await getEvaluationById("99999");
    expect(found).toBeNull();
  });

  // ─── Notes / Grades ───

  it("devrait sauvegarder des notes pour une évaluation", async () => {
    const { addEvaluation } = await import("@/lib/services/evaluation.service");
    const { saveGrades } = await import("@/lib/services/grade.service");
    const { db } = await import("@/lib/db");

    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];

    const evalCreated = await addEvaluation({
      name: "Notes test",
      type: "devoir",
      classId: cls.id,
      subjectId: subjects[5 % subjects.length].id,
      trimester: 1,
      academicYearId: year.id,
      date: "2026-05-25",
    });

    const students = db.all(sql`SELECT id FROM students LIMIT 2`) as { id: number }[];

    const saved = await saveGrades(evalCreated.id, [
      { studentId: students[0].id, score: 15, remarks: "Bien" },
      { studentId: students[1].id, score: 8, remarks: "Peut mieux faire" },
    ]);

    expect(saved.length).toBe(2);
  });

  it("devrait récupérer les notes d'une évaluation", async () => {
    const { addEvaluation } = await import("@/lib/services/evaluation.service");
    const { saveGrades, getGrades } = await import("@/lib/services/grade.service");
    const { db } = await import("@/lib/db");

    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];

    const evalC = await addEvaluation({
      name: "Récup notes",
      type: "devoir",
      classId: cls.id,
      subjectId: subjects[1 % subjects.length].id,
      trimester: 2,
      academicYearId: year.id,
      date: "2026-05-26",
    });

    const students = db.all(sql`SELECT id FROM students LIMIT 2`) as { id: number }[];
    await saveGrades(evalC.id, [
      { studentId: students[0].id, score: 12 },
      { studentId: students[1].id, score: 14 },
    ]);

    const grades = await getGrades(evalC.id);
    expect(grades.length).toBe(2);
    expect(grades[0]).toHaveProperty("score");
    expect(grades[0]).toHaveProperty("studentFirstName");
  });

  it("devrait calculer les statistiques d'une évaluation", async () => {
    const { addEvaluation } = await import("@/lib/services/evaluation.service");
    const { saveGrades, getGradeStats } = await import("@/lib/services/grade.service");
    const { db } = await import("@/lib/db");

    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];

    const evalC = await addEvaluation({
      name: "Stats notes",
      type: "devoir",
      classId: cls.id,
      subjectId: subjects[2 % subjects.length].id,
      trimester: 2,
      academicYearId: year.id,
      date: "2026-05-27",
    });

    const students = db.all(sql`SELECT id FROM students LIMIT 2`) as { id: number }[];
    await saveGrades(evalC.id, [
      { studentId: students[0].id, score: 18 },
      { studentId: students[1].id, score: 10 },
    ]);

    const stats = await getGradeStats(evalC.id);
    expect(stats.count).toBe(2);
    expect(stats.average).toBeGreaterThan(0);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(18);
    expect(stats.successRate).toBeGreaterThanOrEqual(0);
  });

  it("devrait retourner des stats vides si pas de notes", async () => {
    const { getGradeStats } = await import("@/lib/services/grade.service");

    const stats = await getGradeStats("99999");
    expect(stats.count).toBe(0);
    expect(stats.average).toBe(0);
  });

  it("devrait supprimer les notes en cascade lors de la suppression d'une évaluation", async () => {
    const { addEvaluation, removeEvaluation, getEvaluationById } = await import("@/lib/services/evaluation.service");
    const { saveGrades, getGrades } = await import("@/lib/services/grade.service");
    const { db } = await import("@/lib/db");
    const sql = (await import("drizzle-orm")).sql;

    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    let subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];
    const students = db.all(sql`SELECT id FROM students LIMIT 2`) as { id: number }[];
    // Find a subject not yet used with class 1, trimester 1, type 'devoir' to avoid unique constraint
    const [used] = db.all(sql`SELECT subject_id FROM evaluations WHERE class_id = ${cls.id} AND trimester = 1 AND type = 'devoir' LIMIT 1`) as { subject_id: number }[];
    const availSubjects = used ? subjects.filter(s => s.id !== used.subject_id) : subjects;

    const evalC = await addEvaluation({
      name: "Cascade delete test",
      type: "devoir", classId: cls.id,
      subjectId: availSubjects[0].id, trimester: 1,
      academicYearId: year.id, date: "2026-06-10",
    });

    await saveGrades(evalC.id, [
      { studentId: students[0].id, score: 14 },
      { studentId: students[1].id, score: 11 },
    ]);

    let grades_before = await getGrades(evalC.id);
    expect(grades_before.length).toBe(2);

    await removeEvaluation(evalC.id);

    const found = await getEvaluationById(evalC.id);
    expect(found).toBeNull();

    const grades_after = await getGrades(evalC.id);
    expect(grades_after.length).toBe(0);
  });

  it("devrait bloquer l'ajout d'une évaluation si la période est clôturée", async () => {
    const { closePeriod, openPeriod } = await import("@/lib/services/period.service");
    const { addEvaluation } = await import("@/lib/services/evaluation.service");
    const { db } = await import("@/lib/db");
    const sql = (await import("drizzle-orm")).sql;

    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];

    await closePeriod(6, 2026);

    await expect(addEvaluation({
      name: "Période fermée",
      type: "devoir", classId: cls.id,
      subjectId: subjects[0].id, trimester: 1,
      academicYearId: year.id, date: "2026-06-15",
    })).rejects.toThrow("période est clôturée");

    await openPeriod(6, 2026);
  });

  it("devrait bloquer la sauvegarde de notes si la période de l'évaluation est clôturée", async () => {
    const { closePeriod, openPeriod } = await import("@/lib/services/period.service");
    const { addEvaluation } = await import("@/lib/services/evaluation.service");
    const { saveGrades } = await import("@/lib/services/grade.service");
    const { db } = await import("@/lib/db");
    const sql = (await import("drizzle-orm")).sql;

    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];
    const [used] = db.all(sql`SELECT subject_id FROM evaluations WHERE class_id = ${cls.id} AND trimester = 1 AND type = 'devoir' LIMIT 1`) as { subject_id: number }[];
    const availSubjects = used ? subjects.filter(s => s.id !== used.subject_id) : subjects;

    // Create evaluation first, THEN close the period
    const evalC = await addEvaluation({
      name: "Notes période fermée",
      type: "devoir", classId: cls.id,
      subjectId: availSubjects[0].id, trimester: 1,
      academicYearId: year.id, date: "2026-06-20",
    });
    expect(evalC.id).toBeTruthy();

    // Now close the period
    await closePeriod(6, 2026);

    // Now saving grades should fail
    await expect(saveGrades(evalC.id, [
      { studentId: 1, score: 10 },
    ])).rejects.toThrow("période est clôturée");

    await openPeriod(6, 2026);
  });
});
