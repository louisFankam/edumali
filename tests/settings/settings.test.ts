import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { seedClass, seedStudent, seedSubject, seedTeacher, seedAcademicYear, seedEnrollment } from "../helpers/seed";

let classId: string
let subjectId: string
let academicYearId: string

describe("Settings - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId = await seedClass({ name: "6e A", level: 1, capacity: 40 })
    subjectId = await seedSubject({ name: "Mathématiques", coefficient: 4 })
    academicYearId = await seedAcademicYear({ name: "2024-2025", isCurrent: true })
    const { saveSchoolInfo } = await import("@/lib/services/settings.service");
    await saveSchoolInfo({ name: "École Test" });
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  // ─── Classes ───

  it("devrait lister les classes", async () => {
    const { getClasses } = await import("@/lib/services/student.service");
    const classes = await getClasses();
    expect(classes.length).toBeGreaterThan(0);
    expect(classes[0]).toHaveProperty("id");
    expect(classes[0]).toHaveProperty("name");
  });

  it("devrait créer une classe", async () => {
    const { addClass } = await import("@/lib/services/student.service");
    const created = await addClass({
      name: "Terminale S",
      level: 13,
      capacity: 40,
      totalFee: 500000,
    });
    expect(created.name).toBe("Terminale S");
    expect(created.totalFee).toBe(500000);
  });

  it("devrait modifier une classe", async () => {
    const { editClass } = await import("@/lib/services/student.service");
    const updated = await editClass(classId, { name: "6e A Modifiée", totalFee: 75000 });
    expect(updated.name).toBe("6e A Modifiée");
    expect(updated.totalFee).toBe(75000);
  });

  it("devrait supprimer une classe", async () => {
    const { addClass, removeClass } = await import("@/lib/services/student.service");
    const created = await addClass({ name: "À supprimer" });
    await removeClass(created.id);
    const { getClasses } = await import("@/lib/services/student.service");
    const all = await getClasses();
    const found = all.find((c: any) => c.id === created.id);
    expect(found).toBeUndefined();
  });

  it("devrait bloquer la suppression d'une classe avec des élèves", async () => {
    const cid = await seedClass({ name: "Classe Avec Élèves" })
    await seedStudent(cid)
    const { removeClass } = await import("@/lib/services/student.service");
    await expect(removeClass(cid)).rejects.toThrow("contient des élèves");
  });

  // ─── Subjects ───

  it("devrait lister les matières", async () => {
    const { fetchSubjects } = await import("@/lib/services/settings.service");
    const subjects = await fetchSubjects();
    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects[0]).toHaveProperty("name");
    expect(subjects[0]).toHaveProperty("coefficient");
  });

  it("devrait créer une matière", async () => {
    const { addSubject } = await import("@/lib/services/settings.service");
    const created = await addSubject({
      name: "Philosophie",
      code: "PHI",
      coefficient: 3,
      hoursPerWeek: 4,
    });
    expect(created.name).toBe("Philosophie");
    expect(created.coefficient).toBe(3);
  });

  it("devrait modifier une matière", async () => {
    const { editSubject, fetchSubject } = await import("@/lib/services/settings.service");
    await editSubject(subjectId, { name: "Mathématiques (Avancé)", coefficient: 5 });
    const updated = await fetchSubject(subjectId);
    expect(updated.name).toBe("Mathématiques (Avancé)");
    expect(updated.coefficient).toBe(5);
  });

  it("devrait supprimer une matière", async () => {
    const { addSubject, removeSubject, fetchSubject } = await import("@/lib/services/settings.service");
    const created = await addSubject({ name: "Temporaire" });
    await removeSubject(created.id);
    const found = await fetchSubject(created.id);
    expect(found).toBeNull();
  });

  // ─── Subject-Teacher Assignment ───

  it("devrait créer une matière sans enseignant (teacherNumber = 0)", async () => {
    const { addSubject, fetchSubjects } = await import("@/lib/services/settings.service")
    const created = await addSubject({ name: "Sans Prof", code: "SP" })
    const all = await fetchSubjects()
    const found = all.find((s: any) => s.id === created.id)
    expect(found).toBeDefined()
    expect(found!.teacherNumber).toBe(0)
  })

  it("devrait créer une matière avec des enseignants", async () => {
    const tid = await seedTeacher({ firstName: "ProfAdd", lastName: "Creation" })
    const tid2 = await seedTeacher({ firstName: "ProfAdd2", lastName: "Creation" })
    const { addSubject, fetchSubjectWithTeachers } = await import("@/lib/services/settings.service")
    const created = await addSubject({
      name: "Avec Profs",
      code: "AP",
      teacherIds: [tid, tid2],
    })
    expect(created).toBeDefined()
    const detail = await fetchSubjectWithTeachers(created.id)
    expect(detail!.teacherNumber).toBe(2)
    expect(detail!.teachers.some((t: any) => t.id === tid)).toBe(true)
    expect(detail!.teachers.some((t: any) => t.id === tid2)).toBe(true)
  })

  it("devrait assigner des enseignants après création", async () => {
    const tid = await seedTeacher({ firstName: "LateAdd", lastName: "Teacher" })
    const { addSubject, fetchSubjectWithTeachers, updateSubjectTeachers } = await import("@/lib/services/settings.service")
    const created = await addSubject({ name: "Late Assign", code: "LA" })
    let detail = await fetchSubjectWithTeachers(created.id)
    expect(detail!.teacherNumber).toBe(0)
    await updateSubjectTeachers(created.id, [tid])
    detail = await fetchSubjectWithTeachers(created.id)
    expect(detail!.teacherNumber).toBe(1)
    expect(detail!.teachers[0].id).toBe(tid)
  })

  it("devrait retirer des enseignants d'une matière", async () => {
    const tid = await seedTeacher({ firstName: "RemoveMe", lastName: "Teacher" })
    const { addSubject, fetchSubjectWithTeachers, updateSubjectTeachers } = await import("@/lib/services/settings.service")
    const created = await addSubject({ name: "Remove Test", code: "RT", teacherIds: [tid] })
    let detail = await fetchSubjectWithTeachers(created.id)
    expect(detail!.teacherNumber).toBe(1)
    await updateSubjectTeachers(created.id, [])
    detail = await fetchSubjectWithTeachers(created.id)
    expect(detail!.teacherNumber).toBe(0)
    expect(detail!.teachers.length).toBe(0)
  })

  it("devrait lister les enseignants d'une matière via fetchSubjectWithTeachers", async () => {
    const tid1 = await seedTeacher({ firstName: "List", lastName: "Teacher1" })
    const tid2 = await seedTeacher({ firstName: "List", lastName: "Teacher2" })
    const { addSubject, fetchSubjectWithTeachers } = await import("@/lib/services/settings.service")
    const created = await addSubject({ name: "List Test", code: "LT", teacherIds: [tid1, tid2] })
    const detail = await fetchSubjectWithTeachers(created.id)
    expect(detail).not.toBeNull()
    expect(detail!.name).toBe("List Test")
    expect(detail!.teachers.length).toBe(2)
    expect(detail!.teacherNumber).toBe(2)
  })

  // ─── Fee Types ───

  it("devrait lister les types de frais", async () => {
    const { getFeeTypes } = await import("@/lib/services/payment.service");
    const fees = await getFeeTypes();
    expect(Array.isArray(fees)).toBe(true);
  });

  it("devrait créer un type de frais", async () => {
    const { addFeeType } = await import("@/lib/services/payment.service");
    const created = await addFeeType({
      name: "Assurance scolaire",
      amount: 5000,
      period: "annuel",
    });
    expect(created.name).toBe("Assurance scolaire");
    expect(created.amount).toBe(5000);
  });

  it("devrait modifier un type de frais", async () => {
    const { addFeeType, editFeeType, getFeeTypes } = await import("@/lib/services/payment.service");
    const created = await addFeeType({ name: "TestFee", amount: 10000, period: "annuel" });
    await editFeeType(created.id, { name: "TestFeeModifié", amount: 15000 });
    const all = await getFeeTypes();
    const found = all.find((f: any) => f.id === created.id);
    expect(found.name).toBe("TestFeeModifié");
    expect(found.amount).toBe(15000);
  });

  it("devrait supprimer un type de frais", async () => {
    const { addFeeType, removeFeeType, getFeeTypes } = await import("@/lib/services/payment.service");
    const created = await addFeeType({ name: "FeeDelete", amount: 1000, period: "mensuel" });
    await removeFeeType(created.id);
    const all = await getFeeTypes();
    const found = all.find((f: any) => f.id === created.id);
    expect(found).toBeUndefined();
  });

  // ─── Academic Years ───

  it("devrait lister les années scolaires", async () => {
    const { fetchAcademicYears } = await import("@/lib/services/settings.service");
    const years = await fetchAcademicYears();
    expect(years.length).toBeGreaterThan(0);
    expect(years[0]).toHaveProperty("name");
    expect(years[0]).toHaveProperty("startDate");
  });

  it("devrait créer une année scolaire", async () => {
    const { addAcademicYear } = await import("@/lib/services/settings.service");
    const created = await addAcademicYear({
      name: "2027-2028",
      startDate: "2027-09-01",
      endDate: "2028-08-31",
    });
    expect(created.name).toBe("2027-2028");
    expect(created.startDate).toBe("2027-09-01");
    expect(created.isCurrent).toBe(false);
  });

  it("devrait créer une année scolaire comme année courante", async () => {
    const { addAcademicYear, fetchCurrentAcademicYear } = await import("@/lib/services/settings.service");
    const created = await addAcademicYear({
      name: "2028-2029",
      startDate: "2028-09-01",
      endDate: "2029-08-31",
      isCurrent: true,
    });
    expect(created.isCurrent).toBe(true);
    const current = await fetchCurrentAcademicYear();
    expect(current!.id).toBe(created.id);
  });

  it("devrait modifier une année scolaire", async () => {
    const { editAcademicYear, fetchAcademicYear } = await import("@/lib/services/settings.service");
    await editAcademicYear(academicYearId, { name: "2024-2025 Modifié" });
    const updated = await fetchAcademicYear(academicYearId);
    expect(updated.name).toBe("2024-2025 Modifié");
  });

  it("devrait supprimer une année scolaire", async () => {
    const { addAcademicYear, removeAcademicYear, fetchAcademicYears } = await import("@/lib/services/settings.service");
    const created = await addAcademicYear({ name: "TempDelete", startDate: "2030-01-01", endDate: "2030-12-31" });
    await removeAcademicYear(created.id);
    const all = await fetchAcademicYears();
    const found = all.find((y: any) => y.id === created.id);
    expect(found).toBeUndefined();
  });

  it("devrait récupérer l'année courante", async () => {
    const { fetchCurrentAcademicYear } = await import("@/lib/services/settings.service");
    const year = await fetchCurrentAcademicYear();
    expect(year).not.toBeNull();
    expect(year!.isCurrent).toBe(true);
  });

  // ─── School Info ───

  it("devrait récupérer les informations de l'école", async () => {
    const { fetchSchoolInfo } = await import("@/lib/services/settings.service");
    const info = await fetchSchoolInfo();
    expect(info).not.toBeNull();
    expect(info!.name).toBeTruthy();
  });

  it("devrait modifier les informations de l'école", async () => {
    const { saveSchoolInfo, fetchSchoolInfo } = await import("@/lib/services/settings.service");
    await saveSchoolInfo({ name: "École Test Modifiée" });
    const updated = await fetchSchoolInfo();
    expect(updated!.name).toBe("École Test Modifiée");
  });

  // ─── Fix: level / color / delete guards / subject status ───

  it("devrait sauvegarder le niveau comme un entier", async () => {
    const { addClass, getClasses } = await import("@/lib/services/student.service");
    await addClass({ name: "Classe Niveau", level: 2 })
    const all = await getClasses()
    const c = all.find((c: any) => c.name === "Classe Niveau")
    expect(c).toBeDefined()
    expect(c.level).toBe(2)
  })

  it("devrait sauvegarder la couleur comme un hex", async () => {
    const { addClass, getClasses } = await import("@/lib/services/student.service");
    await addClass({ name: "Classe Couleur", color: "#22c55e" })
    const all = await getClasses()
    const c = all.find((c: any) => c.name === "Classe Couleur")
    expect(c).toBeDefined()
    expect(c.color).toBe("#22c55e")
  })

  it("devrait bloquer la suppression d'une classe avec des matières assignées", async () => {
    const cid = await seedClass({ name: "Classe Matières" })
    const sid = await seedSubject({ name: "Matière Bloquante" })
    const { db } = await import("@/lib/db")
    const sql = (await import("drizzle-orm")).sql
    db.run(sql`INSERT INTO class_subjects (class_id, subject_id, coefficient) VALUES (${Number(cid)}, ${Number(sid)}, 1)`)

    const { removeClass } = await import("@/lib/services/student.service");
    await expect(removeClass(cid)).rejects.toThrow("matières assignées")
  })

  it("devrait bloquer la suppression d'une classe avec des présences", async () => {
    const cid = await seedClass({ name: "Classe Présences" })
    const { db } = await import("@/lib/db")
    const sql = (await import("drizzle-orm")).sql
    db.run(sql`PRAGMA foreign_keys = OFF`)
    const rows = db.all(sql`INSERT INTO attendance (student_id, class_id, date, status) VALUES (99999, ${Number(cid)}, '2025-01-15', 'présent') RETURNING id`)
    db.run(sql`PRAGMA foreign_keys = ON`)

    const { removeClass } = await import("@/lib/services/student.service");
    await expect(removeClass(cid)).rejects.toThrow("présences enregistrées")
  })

  it("devrait créer une matière avec le statut inactif si la checkbox est décochée", async () => {
    const { addSubject, fetchSubjects } = await import("@/lib/services/settings.service")
    const created = await addSubject({
      name: "Matière Inactive",
      code: "MI",
      coefficient: 2,
      status: "Inactif",
    })
    expect(created.status).toBe("Inactif")

    const reloaded = await fetchSubjects()
    const found = reloaded.find((s: any) => s.id === created.id)
    expect(found!.status).toBe("Inactif")
  })
});
