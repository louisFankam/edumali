import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { seedClass, seedSubject, seedTeacher } from "../helpers/seed";
import { sql } from "drizzle-orm";

let classId: string
let subjectId1: string
let subjectId2: string

describe("Class-Subjects - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId = await seedClass({ name: "6e A", level: 1, capacity: 40 })
    subjectId1 = await seedSubject({ name: "Mathématiques", coefficient: 4 })
    subjectId2 = await seedSubject({ name: "Français", coefficient: 3 })
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

  it("devrait assigner un enseignant à une matière dans une classe", async () => {
    const { saveClassSubjects, getClassSubjects } = await import("@/lib/services/class-subject.service");
    const { db } = await import("@/lib/db");

    const teacherId = await seedTeacher({ firstName: "Jean", lastName: "Test" });
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [subject] = db.all(sql`SELECT id FROM subjects LIMIT 1`) as { id: number }[];

    const result = await saveClassSubjects(String(cls.id), [
      { subjectId: subject.id, coefficient: 3, teacherId: Number(teacherId) },
    ]);
    expect(result.ok).toBe(true);

    const assigned = await getClassSubjects(String(cls.id));
    expect(assigned.length).toBe(1);
    expect(assigned[0].teacherId).toBe(String(teacherId));
    expect(assigned[0].teacherName).toContain("Jean");
  });

  it("devrait pouvoir modifier l'enseignant d'une matière", async () => {
    const { saveClassSubjects, getClassSubjects, setSubjectTeacherInClass } = await import("@/lib/services/class-subject.service");
    const { db } = await import("@/lib/db");

    const t1 = await seedTeacher({ firstName: "Paul" });
    const t2 = await seedTeacher({ firstName: "Marie" });
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [subject] = db.all(sql`SELECT id FROM subjects LIMIT 1`) as { id: number }[];

    await saveClassSubjects(String(cls.id), [
      { subjectId: subject.id, coefficient: 2, teacherId: Number(t1) },
    ]);
    let assigned = await getClassSubjects(String(cls.id));
    expect(assigned[0].teacherId).toBe(String(t1));

    await setSubjectTeacherInClass(String(cls.id), String(subject.id), String(t2));
    assigned = await getClassSubjects(String(cls.id));
    expect(assigned[0].teacherId).toBe(String(t2));
    expect(assigned[0].teacherName).toContain("Marie");
  });

  it("devrait pouvoir retirer l'enseignant d'une matière (mettre à null)", async () => {
    const { saveClassSubjects, getClassSubjects, setSubjectTeacherInClass } = await import("@/lib/services/class-subject.service");
    const { db } = await import("@/lib/db");

    const t = await seedTeacher({ firstName: "Luc" });
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];
    const [subject] = db.all(sql`SELECT id FROM subjects LIMIT 1`) as { id: number }[];

    await saveClassSubjects(String(cls.id), [
      { subjectId: subject.id, coefficient: 2, teacherId: Number(t) },
    ]);
    let assigned = await getClassSubjects(String(cls.id));
    expect(assigned[0].teacherName).toBeTruthy();

    await setSubjectTeacherInClass(String(cls.id), String(subject.id), null);
    assigned = await getClassSubjects(String(cls.id));
    expect(assigned[0].teacherId).toBeNull();
    expect(assigned[0].teacherName).toBeNull();
  });

  it("devrait permettre des enseignants différents par classe pour une même matière", async () => {
    const { saveClassSubjects, getClassSubjects } = await import("@/lib/services/class-subject.service");
    const { db } = await import("@/lib/db");

    const t1 = await seedTeacher({ firstName: "ClasseA" });
    const t2 = await seedTeacher({ firstName: "ClasseB" });
    const classId2 = await seedClass({ name: "Test 2" });
    const [subject] = db.all(sql`SELECT id FROM subjects LIMIT 1`) as { id: number }[];
    const [cls1] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];

    await saveClassSubjects(String(cls1.id), [
      { subjectId: subject.id, coefficient: 2, teacherId: Number(t1) },
    ]);
    await saveClassSubjects(classId2, [
      { subjectId: subject.id, coefficient: 2, teacherId: Number(t2) },
    ]);

    const a1 = await getClassSubjects(String(cls1.id));
    const a2 = await getClassSubjects(classId2);
    expect(a1[0].teacherId).toBe(String(t1));
    expect(a2[0].teacherId).toBe(String(t2));
    expect(a1[0].teacherId).not.toBe(a2[0].teacherId);
  });
});
