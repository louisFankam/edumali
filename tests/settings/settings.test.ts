import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { sql } from "drizzle-orm";

describe("Settings - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
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
    const updated = await editClass("1", { name: "6e A Modifiée", totalFee: 75000 });
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
    const { removeClass } = await import("@/lib/services/student.service");
    await expect(removeClass("1")).rejects.toThrow("contient des élèves");
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
    await editSubject("1", { name: "Mathématiques (Avancé)", coefficient: 5 });
    const updated = await fetchSubject("1");
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
    await editAcademicYear("1", { name: "2025-2026 Modifié" });
    const updated = await fetchAcademicYear("1");
    expect(updated.name).toBe("2025-2026 Modifié");
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
});
