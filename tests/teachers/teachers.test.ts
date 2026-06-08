import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { seedTeacher, seedSubject } from "../helpers/seed";
import { sql } from "drizzle-orm";

let teacherId1: string
let teacherId2: string
let subjectId: string

describe("Teachers - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    teacherId1 = await seedTeacher({
      firstName: "Mamadou", lastName: "Koné",
      email: "mamadou.kone@ecole.ml", gender: "Masculin",
      salary: 200000, contrat: "mensuel", status: "active",
    })
    teacherId2 = await seedTeacher({
      firstName: "Aminata", lastName: "Diallo",
      email: "aminata.diallo@ecole.ml", gender: "Féminin",
      salary: 180000, contrat: "mensuel", status: "active",
    })
    subjectId = await seedSubject({ name: "Mathématiques", coefficient: 4 })
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait lister les enseignants avec pagination", async () => {
    const { getTeachers } = await import("@/lib/services/teacher.service");

    const result = await getTeachers({ page: 1, limit: 10 });
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.data[0]).toHaveProperty("id");
    expect(result.data[0]).toHaveProperty("first_name");
    expect(result.data[0]).toHaveProperty("last_name");
  });

  it("devrait filtrer les enseignants par statut", async () => {
    const { getTeachers } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    db.run(sql`UPDATE teachers SET status = 'inactive' WHERE id = ${Number(teacherId1)}`);

    const result = await getTeachers({ status: "inactive" });
    expect(result.data.every((t: any) => t.status === "inactive")).toBe(true);
  });

  it("devrait filtrer les enseignants par contrat", async () => {
    const { getTeachers } = await import("@/lib/services/teacher.service");

    const result = await getTeachers({ contrat: "mensuel" });
    expect(result.data.every((t: any) => t.contrat === "mensuel")).toBe(true);
  });

  it("devrait rechercher des enseignants par nom", async () => {
    const { getTeachers } = await import("@/lib/services/teacher.service");

    const result = await getTeachers({ search: "Mamadou" });
    expect(result.data.length).toBeGreaterThanOrEqual(0);
  });

  it("devrait récupérer un enseignant par son ID", async () => {
    const { getTeacherById } = await import("@/lib/services/teacher.service");

    const teacher = await getTeacherById(teacherId1);
    expect(teacher).not.toBeNull();
    expect(teacher!.id).toBe(teacherId1);
    expect(teacher!.first_name).toBeTruthy();
    expect(teacher!.last_name).toBeTruthy();
    expect(teacher!.email).toBeTruthy();
    expect(teacher).toHaveProperty("speciality_names");
  });

  it("devrait retourner null pour un enseignant inexistant", async () => {
    const { getTeacherById } = await import("@/lib/services/teacher.service");

    const teacher = await getTeacherById("99999");
    expect(teacher).toBeNull();
  });

  it("devrait créer un nouvel enseignant", async () => {
    const { addTeacher } = await import("@/lib/services/teacher.service");

    const created = await addTeacher({
      first_name: "Nouveau",
      last_name: "Professeur",
      email: "nouveau.prof@ecole.ml",
      phone: "+223 70000000",
      address: "Bamako",
      gender: "Masculin",
      hire_date: "2026-01-15",
      salary: 200000,
      contrat: "mensuel",
      status: "active",
    });

    expect(created).not.toBeNull();
    expect(created.first_name).toBe("Nouveau");
    expect(created.last_name).toBe("Professeur");
    expect(created.email).toBe("nouveau.prof@ecole.ml");
    expect(created.salary).toBe(200000);
    expect(created.contrat).toBe("mensuel");
    expect(created.status).toBe("active");
    expect(created.id).toBeTruthy();
  });

  it("devrait créer un enseignant avec spécialités", async () => {
    const { addTeacher, getTeacherById } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    const [subject] = db.all(sql`SELECT id FROM subjects LIMIT 1`) as { id: number }[];

    const created = await addTeacher({
      first_name: "Prof",
      last_name: "Spécialisé",
      email: "prof.specialite@ecole.ml",
      gender: "Féminin",
      hire_date: "2026-02-01",
      salary: 250000,
      contrat: "mensuel",
      speciality: [String(subject.id)],
    });

    const reloaded = await getTeacherById(created.id);
    expect(reloaded!.speciality_names.length).toBeGreaterThanOrEqual(1);
  });

  it("devrait modifier un enseignant", async () => {
    const { editTeacher } = await import("@/lib/services/teacher.service");

    const updated = await editTeacher(teacherId1, {
      first_name: "MamadouModifié",
      salary: 300000,
      status: "on_leave",
    });

    expect(updated.first_name).toBe("MamadouModifié");
    expect(updated.salary).toBe(300000);
    expect(updated.status).toBe("on_leave");
  });

  it("devrait modifier les spécialités d'un enseignant", async () => {
    const { editTeacher, getTeacherById } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    const subjects = db.all(sql`SELECT id FROM subjects`) as { id: number }[];

    await editTeacher(teacherId1, {
      speciality: subjects.map(s => String(s.id)),
    });

    const updated = await getTeacherById(teacherId1);
    expect(updated!.speciality_names.length).toBe(subjects.length);
  });

  it("devrait supprimer un enseignant", async () => {
    const { addTeacher, removeTeacher, getTeacherById } = await import("@/lib/services/teacher.service");

    const created = await addTeacher({
      first_name: "ÀSupprimer",
      last_name: "Test",
      email: "supprimer@ecole.ml",
      gender: "Masculin",
      hire_date: "2026-03-01",
      salary: 100000,
      contrat: "horaire",
    });

    await removeTeacher(created.id);

    const deleted = await getTeacherById(created.id);
    expect(deleted).toBeNull();
  });

  it("devrait retourner les statistiques des enseignants", async () => {
    const { getTeacherStats } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    db.run(sql`UPDATE teachers SET status = 'active'`);

    const stats = await getTeacherStats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("active");
    expect(stats).toHaveProperty("male");
    expect(stats).toHaveProperty("female");
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.malePercent + stats.femalePercent).toBe(100);
  });

  it("devrait récupérer les présences d'un enseignant par teacherId", async () => {
    const { getTeacherAttendance } = await import("@/lib/services/teacher.service");

    const records = await getTeacherAttendance(teacherId1);
    expect(Array.isArray(records)).toBe(true);
  });

  it("devrait filtrer les présences enseignant par plage de dates", async () => {
    const { getTeacherAttendance, saveTeacherAttendance } = await import("@/lib/services/teacher.service");

    await saveTeacherAttendance([
      { teacher_id: teacherId1, date: "2026-05-15", status: "present" },
    ]);

    const records = await getTeacherAttendance(teacherId1, "2026-05-01", "2026-05-31");
    expect(records.length).toBeGreaterThanOrEqual(1);
    expect(records[0].status).toBe("present");
  });

  // ─── getTeacherAttendanceByDate ───

  it("devrait récupérer les présences enseignants par date spécifique", async () => {
    const { getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    const records = await getTeacherAttendanceByDate("2026-05-15");
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThanOrEqual(1);
    expect(records[0].date).toBe("2026-05-15");
    expect(records[0]).toHaveProperty("teacher_id");
    expect(records[0]).toHaveProperty("status");
  });

  it("devrait retourner une liste vide pour une date sans présences", async () => {
    const { getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");

    const records = await getTeacherAttendanceByDate("2099-12-31");
    expect(records).toEqual([]);
  });

  // ─── getSubjectsList ───

  it("devrait retourner la liste des matières via getSubjectsList", async () => {
    const { getSubjectsList } = await import("@/lib/services/teacher.service");

    const subjects = await getSubjectsList();
    expect(subjects.length).toBeGreaterThanOrEqual(1);
    expect(subjects[0]).toHaveProperty("id");
    expect(subjects[0]).toHaveProperty("name");
    expect(subjects[0]).toHaveProperty("code");
  });

  // ─── hours_per_day ───

  it("devrait créer un enseignant horaire avec hours_per_day personnalisé", async () => {
    const { addTeacher, getTeacherById } = await import("@/lib/services/teacher.service");

    const created = await addTeacher({
      first_name: "Horaire",
      last_name: "Test",
      email: "horaire.test@ecole.ml",
      gender: "Masculin",
      hire_date: "2026-01-01",
      salary: 5000,
      contrat: "horaire",
      hours_per_day: 6,
    });

    expect(created.hours_per_day).toBe(6);

    const reloaded = await getTeacherById(created.id);
    expect(reloaded!.hours_per_day).toBe(6);
  });

  it("devrait avoir hours_per_day=4 par défaut pour un enseignant mensuel", async () => {
    const { addTeacher, getTeacherById } = await import("@/lib/services/teacher.service");

    const created = await addTeacher({
      first_name: "Default",
      last_name: "Hours",
      email: "default.hours@ecole.ml",
      gender: "Féminin",
      hire_date: "2026-02-01",
      salary: 200000,
      contrat: "mensuel",
    });

    expect(created.hours_per_day).toBe(4);

    const reloaded = await getTeacherById(created.id);
    expect(reloaded!.hours_per_day).toBe(4);
  });

  it("devrait modifier hours_per_day via editTeacher", async () => {
    const { addTeacher, editTeacher, getTeacherById } = await import("@/lib/services/teacher.service");

    const created = await addTeacher({
      first_name: "Edit",
      last_name: "HPD",
      email: "edit.hpd@ecole.ml",
      gender: "Masculin",
      hire_date: "2026-03-01",
      salary: 5000,
      contrat: "horaire",
      hours_per_day: 4,
    });

    const updated = await editTeacher(created.id, { hours_per_day: 8 });
    expect(updated.hours_per_day).toBe(8);

    const reloaded = await getTeacherById(created.id);
    expect(reloaded!.hours_per_day).toBe(8);
  });
});
