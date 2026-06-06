import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { seedClass, seedSubject, seedStudent, seedAcademicYear, seedEnrollment } from "../helpers/seed";
import { sql } from "drizzle-orm";

let classId: string
let subjectId1: string
let subjectId2: string
let studentId1: string
let studentId2: string
let academicYearId: string

describe("Bulletins - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId = await seedClass({ name: "6e A", level: 1, capacity: 40 })
    subjectId1 = await seedSubject({ name: "Mathématiques", coefficient: 4 })
    subjectId2 = await seedSubject({ name: "Français", coefficient: 3 })
    academicYearId = await seedAcademicYear({ name: "2024-2025", isCurrent: true })
    studentId1 = await seedStudent(classId, {
      firstName: "Amadou", lastName: "Diallo",
      gender: "Masculin", parentName: "Moussa Diallo", parentPhone: "70123456",
    })
    studentId2 = await seedStudent(classId, {
      firstName: "Fatoumata", lastName: "Traoré",
      gender: "Féminin", parentName: "Oumar Traoré", parentPhone: "66123456",
    })
    await seedEnrollment(studentId1, classId, academicYearId)
    await seedEnrollment(studentId2, classId, academicYearId)
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait générer un bulletin pour une classe avec évaluations et notes", async () => {
    const { db } = await import("@/lib/db");

    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [subject1, subject2] = db.all(sql`SELECT id FROM subjects LIMIT 2`) as { id: number }[];
    const [student1, student2] = db.all(sql`SELECT id FROM students LIMIT 2`) as { id: number }[];

    // Crée des évaluations
    const { addEvaluation } = await import("@/lib/services/evaluation.service");
    const eval1 = await addEvaluation({
      name: "Devoir Maths", type: "devoir",
      classId: cls.id, subjectId: subject1.id,
      trimester: 1, academicYearId: year.id, date: "2026-05-10",
    });
    const eval2 = await addEvaluation({
      name: "Devoir Français", type: "devoir",
      classId: cls.id, subjectId: subject2.id,
      trimester: 1, academicYearId: year.id, date: "2026-05-12",
    });
    const eval3 = await addEvaluation({
      name: "Trimestrielle Maths", type: "trimestrielle",
      classId: cls.id, subjectId: subject1.id,
      trimester: 1, academicYearId: year.id, date: "2026-06-01",
    });
    const eval4 = await addEvaluation({
      name: "Trimestrielle Français", type: "trimestrielle",
      classId: cls.id, subjectId: subject2.id,
      trimester: 1, academicYearId: year.id, date: "2026-06-03",
    });

    // Assigne les matières à la classe
    const { saveClassSubjects } = await import("@/lib/services/class-subject.service");
    await saveClassSubjects(String(cls.id), [
      { subjectId: subject1.id, coefficient: 4 },
      { subjectId: subject2.id, coefficient: 3 },
    ]);

    // Ajoute des notes
    const { saveGrades } = await import("@/lib/services/grade.service");
    await saveGrades(eval1.id, [
      { studentId: student1.id, score: 15 },
      { studentId: student2.id, score: 12 },
    ]);
    await saveGrades(eval2.id, [
      { studentId: student1.id, score: 14 },
      { studentId: student2.id, score: 10 },
    ]);
    await saveGrades(eval3.id, [
      { studentId: student1.id, score: 16 },
      { studentId: student2.id, score: 8 },
    ]);
    await saveGrades(eval4.id, [
      { studentId: student1.id, score: 13 },
      { studentId: student2.id, score: 11 },
    ]);

    // Génère le bulletin
    const { computeClassBulletin } = await import("@/lib/services/bulletin.service");
    const bulletin = await computeClassBulletin(cls.id, 1, year.id);

    expect(bulletin.className).toBeTruthy();
    expect(bulletin.trimester).toBe(1);
    expect(bulletin.students.length).toBe(2);
    expect(bulletin.subjectCount).toBe(2);
    expect(bulletin.studentCount).toBe(2);

    // Vérifie les calculs pour le premier étudiant (15 et 16 en maths, 14 et 13 en français)
    const student1Bulletin = bulletin.students.find(s => s.studentId === String(student1.id));
    expect(student1Bulletin).toBeDefined();
    expect(student1Bulletin!.subjects.length).toBe(2);
    expect(student1Bulletin!.generalAverage).toBeGreaterThan(0);
    expect(student1Bulletin!.mention).toBeTruthy();
    expect(student1Bulletin!.rank).toBe(1);
  });

  it("devrait lever une erreur pour une classe inexistante", async () => {
    const { computeClassBulletin } = await import("@/lib/services/bulletin.service");
    const { db } = await import("@/lib/db");
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    await expect(computeClassBulletin(99999, 1, year.id)).rejects.toThrow("Classe introuvable");
  });

  it("devrait lever une erreur si aucune évaluation pour le trimestre", async () => {
    const { computeClassBulletin } = await import("@/lib/services/bulletin.service");
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    await expect(computeClassBulletin(cls.id, 3, year.id)).rejects.toThrow("Aucune évaluation");
  });

  it("devrait afficher le rang avec le dénominateur (ex: 1/2)", async () => {
    const { computeClassBulletin } = await import("@/lib/services/bulletin.service");
    const { db } = await import("@/lib/db");
    const sqlFn = (await import("drizzle-orm")).sql;

    const [year] = db.all(sqlFn`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sqlFn`SELECT id FROM classes LIMIT 1`) as { id: number }[];

    const bulletin = await computeClassBulletin(cls.id, 1, year.id);
    const ranked = bulletin.students.filter(s => s.rank !== null);
    expect(ranked.length).toBeGreaterThan(0);
    ranked.forEach(s => {
      expect(s.totalStudents).toBe(ranked.length);
      expect(s.rank).toBeGreaterThanOrEqual(1);
      expect(s.rank).toBeLessThanOrEqual(s.totalStudents);
    });
  });
});
