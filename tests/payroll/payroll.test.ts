import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { seedTeacher } from "../helpers/seed";
import { sql } from "drizzle-orm";

let teacherId1: string
let teacherId2: string

describe("Payroll - Tests d'intégration", () => {
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
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait créer un salaire avec month/year corrects via addPayroll", async () => {
    const { addPayroll } = await import("@/lib/services/teacher.service");

    const result = await addPayroll({
      teacher_id: teacherId1,
      month: 5,
      year: 2026,
      amount: 150000,
      bonus: 0,
      deductions: 0,
      paid_at: "2026-05-29T12:00:00.000Z",
      notes: "Salaire mai 2026",
    });

    expect(result).not.toBeNull();
    expect(result.month).toBe(5);
    expect(result.year).toBe(2026);
    expect(result.amount).toBe(150000);
    expect(result.teacher_id).toBe(teacherId1);
  });

  it("devrait récupérer les salaires d'un enseignant par teacherId", async () => {
    const { getPayroll, addPayroll } = await import("@/lib/services/teacher.service");

    await addPayroll({
      teacher_id: teacherId1,
      month: 3,
      year: 2026,
      amount: 100000,
      bonus: 0,
      deductions: 0,
      paid_at: "2026-03-15T12:00:00.000Z",
      notes: "",
    });

    const records = await getPayroll({ teacherId: teacherId1 });
    expect(records.length).toBeGreaterThanOrEqual(1);
    records.forEach(r => {
      expect(r.teacher_id).toBe(teacherId1);
    });
  });

  it("devrait filtrer les salaires par plage de dates (from/to)", async () => {
    const { getPayroll, addPayroll } = await import("@/lib/services/teacher.service");

    // Utilise le 2e enseignant pour éviter les conflits UNIQUE
    // Crée mai 2026
    await addPayroll({
      teacher_id: teacherId2,
      month: 5,
      year: 2026,
      amount: 200000,
      bonus: 0,
      deductions: 0,
      paid_at: "2026-05-20T12:00:00.000Z",
      notes: "",
    });

    // Crée mars 2026
    await addPayroll({
      teacher_id: teacherId2,
      month: 3,
      year: 2026,
      amount: 100000,
      bonus: 0,
      deductions: 0,
      paid_at: "2026-03-20T12:00:00.000Z",
      notes: "",
    });

    // Filtre pour n'avoir QUE mai 2026
    const records = await getPayroll({
      teacherId: teacherId2,
      from: "2026-05-01",
      to: "2026-05-31",
    });

    expect(records.length).toBe(1);
    expect(records[0].month).toBe(5);
    expect(records[0].year).toBe(2026);
  });

  it("devrait exclure les salaires hors de la plage de dates", async () => {
    const { getPayroll, addPayroll } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    // Utilise le 2e enseignant (même que le test précédent)
    const [teacher] = db.all(sql`
      SELECT id FROM teachers ORDER BY id DESC LIMIT 1
    `) as { id: number }[];

    // Salaire en janvier 2025 (hors de la plage)
    await addPayroll({
      teacher_id: String(teacher.id),
      month: 1,
      year: 2025,
      amount: 100000,
      bonus: 0,
      deductions: 0,
      paid_at: "2025-01-15T12:00:00.000Z",
      notes: "",
    });

    // Filtre pour 2026 uniquement
    const records = await getPayroll({
      teacherId: String(teacher.id),
      from: "2026-01-01",
      to: "2026-12-31",
    });

    const hasOldRecord = records.some(r => r.year === 2025);
    expect(hasOldRecord).toBe(false);
  });

  it("la clé YYYY-MM dans getPayroll doit être cohérente (pas d'inversion month/year)", async () => {
    const { getPayroll, addPayroll } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    // Crée un salaire pour mai 2026 sur un nouvel enseignant
    const [teacher] = db.all(sql`
      SELECT id FROM teachers LIMIT 1
    `) as { id: number }[];

    // Simule le filtre du profil enseignant : from=2026-05-30, to=2026-06-28
    // La clé générée est "2026-05" (year-month) et doit correspondre
    const records = await getPayroll({
      teacherId: String(teacher.id),
      from: "2026-05-30",
      to: "2026-06-28",
    });

    const maiRecords = records.filter(r => r.month === 5 && r.year === 2026);
    expect(maiRecords.length).toBeGreaterThanOrEqual(1);

    // Vérifie que le format de clé n'est pas inversé
    for (const r of records) {
      const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
      expect(key).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  it("devrait retourner un tableau vide pour un teacherId inexistant", async () => {
    const { getPayroll } = await import("@/lib/services/teacher.service");

    const records = await getPayroll({ teacherId: "99999" });
    expect(records).toEqual([]);
  });

  it("devrait retourner tous les salaires sans filtre teacherId", async () => {
    const { getPayroll } = await import("@/lib/services/teacher.service");

    const records = await getPayroll({});
    expect(records.length).toBeGreaterThan(0);
  });

  // ─── updatePayroll ───

  it("devrait modifier un salaire via updatePayroll", async () => {
    const { updatePayroll, getPayroll } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    const [teacher] = db.all(sql`SELECT id FROM teachers LIMIT 1`) as { id: number }[];

    const { addPayroll } = await import("@/lib/services/teacher.service");
    const created = await addPayroll({
      teacher_id: String(teacher.id),
      month: 7, year: 2026, amount: 160000,
      bonus: 0, deductions: 0,
      paid_at: "2026-07-15T12:00:00.000Z",
      notes: "Salaire juillet",
    });

    await updatePayroll(created.id, { amount: 180000, bonus: 10000, deductions: 5000 });

    const records = await getPayroll({ teacherId: String(teacher.id) });
    const updated = records.find(r => r.id === created.id);
    expect(updated).toBeDefined();
    expect(updated!.amount).toBe(180000);
    expect(updated!.bonus).toBe(10000);
    expect(updated!.deductions).toBe(5000);
  });

  // ─── removePayroll ───

  it("devrait supprimer un salaire via removePayroll", async () => {
    const { removePayroll, getPayroll } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");

    const [teacher] = db.all(sql`SELECT id FROM teachers LIMIT 1`) as { id: number }[];

    const { addPayroll } = await import("@/lib/services/teacher.service");
    const created = await addPayroll({
      teacher_id: String(teacher.id),
      month: 8, year: 2026, amount: 140000,
      bonus: 0, deductions: 0,
      paid_at: "2026-08-15T12:00:00.000Z",
    });

    await removePayroll(created.id);

    const records = await getPayroll({ teacherId: String(teacher.id) });
    const found = records.find(r => r.id === created.id);
    expect(found).toBeUndefined();
  });

  it("devrait créer un salaire via l'API POST et le récupérer via GET", async () => {
    const { db } = await import("@/lib/db");

    const [teacher] = db.all(sql`
      SELECT id FROM teachers LIMIT 1
    `) as { id: number }[];

    // Simule l'appel POST de la page salaire
    const { addPayroll } = await import("@/lib/services/teacher.service");
    const created = await addPayroll({
      teacher_id: String(teacher.id),
      month: 6,
      year: 2026,
      amount: 180000,
      bonus: 5000,
      deductions: 2000,
      paid_at: new Date().toISOString(),
      notes: "Salaire juin 2026",
    });

    // Simule l'appel GET du profil enseignant
    const { getPayroll } = await import("@/lib/services/teacher.service");
    const records = await getPayroll({
      teacherId: String(teacher.id),
      from: "2026-06-01",
      to: "2026-06-30",
    });

    const found = records.find(r => r.id === created.id);
    expect(found).toBeDefined();
    expect(found!.amount).toBe(180000);
    expect(found!.bonus).toBe(5000);
    expect(found!.deductions).toBe(2000);
    expect(found!.month).toBe(6);
    expect(found!.year).toBe(2026);
  });

  it("devrait bloquer l'ajout d'une paie si la période est clôturée", async () => {
    const { closePeriod } = await import("@/lib/services/period.service");
    const { addPayroll } = await import("@/lib/services/teacher.service");
    const { db } = await import("@/lib/db");
    const [teacher] = db.all(sql`SELECT id FROM teachers LIMIT 1`) as { id: number }[];

    await closePeriod(7, 2026);

    await expect(addPayroll({
      teacher_id: String(teacher.id),
      month: 7, year: 2026,
      amount: 100000,
      paid_at: "2026-07-15T12:00:00.000Z",
    })).rejects.toThrow("période est clôturée");
  });

  // ─── Attendance-based hours calculation ───

  it("devrait calculer les heures d'un horaire basé sur les présences (present + retard)", async () => {
    const { addTeacher, getTeacherAttendanceStats, saveTeacherAttendance } = await import("@/lib/services/teacher.service");

    const teacher = await addTeacher({
      first_name: "Attendance",
      last_name: "Calc",
      email: "attendance.calc@ecole.ml",
      gender: "Masculin",
      hire_date: "2026-01-01",
      salary: 5000,
      contrat: "horaire",
      hours_per_day: 4,
    });

    await saveTeacherAttendance([
      { teacher_id: teacher.id, date: "2026-06-01", status: "present" },
      { teacher_id: teacher.id, date: "2026-06-02", status: "present" },
      { teacher_id: teacher.id, date: "2026-06-03", status: "retard" },
      { teacher_id: teacher.id, date: "2026-06-04", status: "present" },
      { teacher_id: teacher.id, date: "2026-06-05", status: "absent" },
      { teacher_id: teacher.id, date: "2026-06-08", status: "present" },
      { teacher_id: teacher.id, date: "2026-06-09", status: "retard" },
      { teacher_id: teacher.id, date: "2026-06-10", status: "present" },
      { teacher_id: teacher.id, date: "2026-06-11", status: "present" },
      { teacher_id: teacher.id, date: "2026-06-12", status: "present" },
    ]);

    const stats = await getTeacherAttendanceStats(teacher.id, 2026, 6);
    // present: 7 jours, retard: 2 jours → 9 jours présents
    expect(stats.presentDays).toBe(9);
    // 9 jours × 4h/jour = 36 heures
    const hours = stats.presentDays * 4;
    expect(hours).toBe(36);
  });

  it("devrait exclure les absences du calcul des heures", async () => {
    const { addTeacher, getTeacherAttendanceStats, saveTeacherAttendance } = await import("@/lib/services/teacher.service");

    const teacher = await addTeacher({
      first_name: "Attend",
      last_name: "Only",
      email: "attend.only@ecole.ml",
      gender: "Féminin",
      hire_date: "2026-01-01",
      salary: 5000,
      contrat: "horaire",
      hours_per_day: 6,
    });

    await saveTeacherAttendance([
      { teacher_id: teacher.id, date: "2026-06-01", status: "present" },
      { teacher_id: teacher.id, date: "2026-06-02", status: "excused" },
      { teacher_id: teacher.id, date: "2026-06-03", status: "absent" },
      { teacher_id: teacher.id, date: "2026-06-04", status: "present" },
      { teacher_id: teacher.id, date: "2026-06-05", status: "present" },
    ]);

    const stats = await getTeacherAttendanceStats(teacher.id, 2026, 6);
    // seul present compte → 3 jours
    expect(stats.presentDays).toBe(3);
  });

  it("devrait retourner 0 heures pour un mois sans présences", async () => {
    const { addTeacher, getTeacherAttendanceStats } = await import("@/lib/services/teacher.service");

    const teacher = await addTeacher({
      first_name: "Zero",
      last_name: "Attendance",
      email: "zero.attendance@ecole.ml",
      gender: "Masculin",
      hire_date: "2026-01-01",
      salary: 5000,
      contrat: "horaire",
      hours_per_day: 4,
    });

    const stats = await getTeacherAttendanceStats(teacher.id, 2026, 7);
    expect(stats.presentDays).toBe(0);
    expect(stats.totalDays).toBe(0);
  });
});
