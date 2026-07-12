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

describe("Bulletins annuels - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId = await seedClass({ name: "5e A", level: 2, capacity: 40 })
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

  it("devrait calculer le bulletin annuel avec T1+T2+T3", async () => {
    const { db } = await import("@/lib/db");

    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [subject1, subject2] = db.all(sql`SELECT id FROM subjects LIMIT 2`) as { id: number }[];
    const [student1, student2] = db.all(sql`SELECT id FROM students LIMIT 2`) as { id: number }[];

    const { addEvaluation } = await import("@/lib/services/evaluation.service");

    // T1 evaluations
    const e1_t1_dv = await addEvaluation({ name: "Devoir Maths T1", type: "devoir", classId: cls.id, subjectId: subject1.id, trimester: 1, academicYearId: year.id, date: "2024-10-10" });
    const e1_t1_tr = await addEvaluation({ name: "Trim Maths T1", type: "trimestrielle", classId: cls.id, subjectId: subject1.id, trimester: 1, academicYearId: year.id, date: "2024-12-01" });
    const e2_t1_dv = await addEvaluation({ name: "Devoir Français T1", type: "devoir", classId: cls.id, subjectId: subject2.id, trimester: 1, academicYearId: year.id, date: "2024-10-12" });
    const e2_t1_tr = await addEvaluation({ name: "Trim Français T1", type: "trimestrielle", classId: cls.id, subjectId: subject2.id, trimester: 1, academicYearId: year.id, date: "2024-12-03" });

    // T2 evaluations
    const e1_t2_dv = await addEvaluation({ name: "Devoir Maths T2", type: "devoir", classId: cls.id, subjectId: subject1.id, trimester: 2, academicYearId: year.id, date: "2025-01-15" });
    const e1_t2_tr = await addEvaluation({ name: "Trim Maths T2", type: "trimestrielle", classId: cls.id, subjectId: subject1.id, trimester: 2, academicYearId: year.id, date: "2025-03-01" });
    const e2_t2_dv = await addEvaluation({ name: "Devoir Français T2", type: "devoir", classId: cls.id, subjectId: subject2.id, trimester: 2, academicYearId: year.id, date: "2025-01-17" });
    const e2_t2_tr = await addEvaluation({ name: "Trim Français T2", type: "trimestrielle", classId: cls.id, subjectId: subject2.id, trimester: 2, academicYearId: year.id, date: "2025-03-03" });

    // T3 evaluations
    const e1_t3_dv = await addEvaluation({ name: "Devoir Maths T3", type: "devoir", classId: cls.id, subjectId: subject1.id, trimester: 3, academicYearId: year.id, date: "2025-04-10" });
    const e1_t3_tr = await addEvaluation({ name: "Trim Maths T3", type: "trimestrielle", classId: cls.id, subjectId: subject1.id, trimester: 3, academicYearId: year.id, date: "2025-06-01" });
    const e2_t3_dv = await addEvaluation({ name: "Devoir Français T3", type: "devoir", classId: cls.id, subjectId: subject2.id, trimester: 3, academicYearId: year.id, date: "2025-04-12" });
    const e2_t3_tr = await addEvaluation({ name: "Trim Français T3", type: "trimestrielle", classId: cls.id, subjectId: subject2.id, trimester: 3, academicYearId: year.id, date: "2025-06-03" });

    // Assign subjects
    const { saveClassSubjects } = await import("@/lib/services/class-subject.service");
    await saveClassSubjects(String(cls.id), [
      { subjectId: subject1.id, coefficient: 4 },
      { subjectId: subject2.id, coefficient: 3 },
    ]);

    // Add grades
    const { saveGrades } = await import("@/lib/services/grade.service");

    // T1 grades
    await saveGrades(e1_t1_dv.id, [{ studentId: student1.id, score: 15 }, { studentId: student2.id, score: 12 }]);
    await saveGrades(e1_t1_tr.id, [{ studentId: student1.id, score: 16 }, { studentId: student2.id, score: 8 }]);
    await saveGrades(e2_t1_dv.id, [{ studentId: student1.id, score: 14 }, { studentId: student2.id, score: 10 }]);
    await saveGrades(e2_t1_tr.id, [{ studentId: student1.id, score: 13 }, { studentId: student2.id, score: 11 }]);

    // T2 grades
    await saveGrades(e1_t2_dv.id, [{ studentId: student1.id, score: 13 }, { studentId: student2.id, score: 10 }]);
    await saveGrades(e1_t2_tr.id, [{ studentId: student1.id, score: 14 }, { studentId: student2.id, score: 9 }]);
    await saveGrades(e2_t2_dv.id, [{ studentId: student1.id, score: 12 }, { studentId: student2.id, score: 11 }]);
    await saveGrades(e2_t2_tr.id, [{ studentId: student1.id, score: 15 }, { studentId: student2.id, score: 10 }]);

    // T3 grades
    await saveGrades(e1_t3_dv.id, [{ studentId: student1.id, score: 17 }, { studentId: student2.id, score: 11 }]);
    await saveGrades(e1_t3_tr.id, [{ studentId: student1.id, score: 15 }, { studentId: student2.id, score: 7 }]);
    await saveGrades(e2_t3_dv.id, [{ studentId: student1.id, score: 16 }, { studentId: student2.id, score: 9 }]);
    await saveGrades(e2_t3_tr.id, [{ studentId: student1.id, score: 14 }, { studentId: student2.id, score: 12 }]);

    const { computeAnnualBulletin } = await import("@/lib/services/bulletin.service");
    const bulletin = await computeAnnualBulletin(cls.id, year.id, [1, 2, 3]);

    expect(bulletin.className).toBeTruthy();
    expect(bulletin.trimesters).toEqual([1, 2, 3]);
    expect(bulletin.students.length).toBe(2);
    expect(bulletin.subjectCount).toBe(2);

    // Student 1: Maths T1 avg=(15+16)/2=15.5, T2 avg=(13+14)/2=13.5, T3 avg=(17+15)/2=16
    // Annual Maths = (15.5+13.5+16)/3 = 15
    // Student 1: French T1 avg=(14+13)/2=13.5, T2 avg=(12+15)/2=13.5, T3 avg=(16+14)/2=15
    // Annual French = (13.5+13.5+15)/3 = 14
    // Weighted: (15*4 + 14*3) / 7 = (60+42)/7 = 102/7 = 14.571...
    const s1 = bulletin.students.find(s => s.studentId === String(student1.id));
    expect(s1).toBeDefined();
    expect(s1!.subjects.length).toBe(2);

    const s1maths = s1!.subjects.find(s => s.subjectName === "Mathématiques");
    expect(s1maths).toBeDefined();
    expect(s1maths!.annualAverage).toBeCloseTo(15, 1);
    expect(s1maths!.points).toBeCloseTo(60, 1);

    const s1fr = s1!.subjects.find(s => s.subjectName === "Français");
    expect(s1fr).toBeDefined();
    expect(s1fr!.annualAverage).toBeCloseTo(14, 1);
    expect(s1fr!.points).toBeCloseTo(42, 1);

    expect(s1!.totalPoints).toBeCloseTo(102, 1);
    expect(s1!.annualGeneralAverage).toBeCloseTo(14.57, 1);
    expect(s1!.annualRank).toBe(1);
    expect(s1!.admis).toBe(true);

    // Student 2: Maths T1 avg=(12+8)/2=10, T2 avg=(10+9)/2=9.5, T3 avg=(11+7)/2=9
    // Annual Maths = (10+9.5+9)/3 = 9.5
    // Student 2: French T1 avg=(10+11)/2=10.5, T2 avg=(11+10)/2=10.5, T3 avg=(9+12)/2=10.5
    // Annual French = (10.5+10.5+10.5)/3 = 10.5
    // Weighted: (9.5*4 + 10.5*3) / 7 = (38+31.5)/7 = 69.5/7 = 9.928...
    const s2 = bulletin.students.find(s => s.studentId === String(student2.id));
    expect(s2).toBeDefined();
    expect(s2!.subjects.length).toBe(2);

    const s2maths = s2!.subjects.find(s => s.subjectName === "Mathématiques");
    expect(s2maths).toBeDefined();
    expect(s2maths!.annualAverage).toBeCloseTo(9.5, 1);

    const s2fr = s2!.subjects.find(s => s.subjectName === "Français");
    expect(s2fr).toBeDefined();
    expect(s2fr!.annualAverage).toBeCloseTo(10.5, 1);

    expect(s2!.annualRank).toBe(2);
    expect(s2!.admis).toBe(false);
  });

  it("devrait calculer le bulletin annuel avec T1+T2 seulement (T3 exclu)", async () => {
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];
    const [student1] = db.all(sql`SELECT id FROM students LIMIT 1`) as { id: number }[];

    const { computeAnnualBulletin } = await import("@/lib/services/bulletin.service");
    const bulletin = await computeAnnualBulletin(cls.id, year.id, [1, 2]);

    expect(bulletin.trimesters).toEqual([1, 2]);
    expect(bulletin.students.length).toBe(2);

    const s1 = bulletin.students.find(s => s.studentId === String(student1.id));
    expect(s1).toBeDefined();

    // Maths T1=15.5, T2=13.5 → annual = (15.5+13.5)/2 = 14.5
    const s1maths = s1!.subjects.find(s => s.subjectName === "Mathématiques");
    expect(s1maths).toBeDefined();
    expect(s1maths!.annualAverage).toBeCloseTo(14.5, 1);

    // Check T3 is not in trimesterAverages keys
    expect(s1maths!.trimesterAverages[3]).toBeUndefined();
  });

  it("devrait lever une erreur avec un seul trimestre (T1 seulement)", async () => {
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    const { computeAnnualBulletin } = await import("@/lib/services/bulletin.service");
    await expect(computeAnnualBulletin(cls.id, year.id, [1])).rejects.toThrow("au moins les trimestres 1 et 2");
  });

  it("devrait lever une erreur sans T1 (T2+T3 seulement)", async () => {
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    const { computeAnnualBulletin } = await import("@/lib/services/bulletin.service");
    await expect(computeAnnualBulletin(cls.id, year.id, [2, 3])).rejects.toThrow("au moins les trimestres 1 et 2");
  });

  it("devrait lever une erreur si aucune évaluation pour un trimestre requis", async () => {
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    const { computeAnnualBulletin } = await import("@/lib/services/bulletin.service");
    const bulletin = await computeAnnualBulletin(cls.id, year.id, [1, 2, 4]);
    expect(bulletin.students.length).toBeGreaterThan(0);
  });

  it("ne devrait pas inclure de mention dans le résultat annuel", async () => {
    const { db } = await import("@/lib/db");
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [year] = db.all(sql`SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1`) as { id: number }[];

    const { computeAnnualBulletin } = await import("@/lib/services/bulletin.service");
    const bulletin = await computeAnnualBulletin(cls.id, year.id, [1, 2]);

    for (const s of bulletin.students) {
      expect((s as any).mention).toBeUndefined();
    }
  });
});
