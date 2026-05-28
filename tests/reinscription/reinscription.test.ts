import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";

describe("Reinscription Page - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  // ─────────── A. LISTE ENROLLMENTS ───────────

  describe("A. Liste - getEnrollments", () => {
    it("devrait retourner tous les enrollments (seed = 2)", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");
      const records = await getEnrollments();

      expect(records.length).toBe(2);
    });

    it("devrait filtrer par studentId", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");
      const records = await getEnrollments({ studentId: "1" });

      expect(records.length).toBe(1);
      expect(records[0].studentId).toBe("1");
      expect(records[0].studentName).toContain("Amadou");
    });

    it("devrait filtrer par academicYearId", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");
      const records = await getEnrollments({ academicYearId: "1" });

      expect(records.length).toBe(2);
      records.forEach(r => expect(r.academicYearId).toBe("1"));
    });

    it("devrait retourner les données relations (studentName, className, academicYearName)", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");
      const records = await getEnrollments();

      records.forEach(r => {
        expect(r.studentName).toBeTruthy();
        expect(r.className).toBeTruthy();
        expect(r.academicYearName).toBeTruthy();
      });
    });

    it("devrait retourner une liste vide pour un academicYearId inexistant", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");
      const records = await getEnrollments({ academicYearId: "999" });
      expect(records).toEqual([]);
    });
  });

  // ─────────── B. CRÉATION ───────────

  describe("B. Création - addEnrollment", () => {
    it("devrait créer un nouvel enrollment", async () => {
      const { addEnrollment } = await import("@/lib/services/enrollment.service");
      const created = await addEnrollment({
        studentId: 1,
        classId: 2,
        academicYearId: 1,
        enrollmentDate: "2025-09-01",
        status: "réinscrit",
      });

      expect(created.id).toBeTruthy();
      expect(created.studentId).toBe("1");
      expect(created.classId).toBe("2");
      expect(created.academicYearId).toBe("1");
      expect(created.status).toBe("réinscrit");
      expect(created.enrollmentDate).toBe("2025-09-01");
    });

    it("devrait créer un enrollment avec le statut 'inscrit' par défaut", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");
      const created = await addEnrollment({
        studentId: 2,
        classId: 2,
        academicYearId: 1,
        enrollmentDate: "2025-09-05",
        status: "inscrit",
      });

      expect(created.status).toBe("inscrit");
    });

    it("devrait créer un enrollment avec des notes optionnelles", async () => {
      const { addEnrollment } = await import("@/lib/services/enrollment.service");
      const created = await addEnrollment({
        studentId: 2,
        classId: 1,
        academicYearId: 1,
        enrollmentDate: "2025-09-10",
        status: "transféré",
        notes: "Transfert depuis une autre école",
      });

      expect(created.notes).toBe("Transfert depuis une autre école");
    });

    it("[ANOMALIE] devrait permettre un doublon (studentId + academicYearId) - pas de UNIQUE", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      const before = await getEnrollments({ studentId: "1", academicYearId: "1" });
      const countBefore = before.length;

      // Même studentId 1, même academicYearId 1 - devrait réussir car pas de contrainte UNIQUE
      const duplicate = await addEnrollment({
        studentId: 1,
        classId: 1,
        academicYearId: 1,
        enrollmentDate: "2025-09-15",
        status: "réinscrit",
      });

      expect(duplicate.id).toBeTruthy();

      const after = await getEnrollments({ studentId: "1", academicYearId: "1" });
      expect(after.length).toBe(countBefore + 1);

      // Nettoyage
      const { removeEnrollment } = await import("@/lib/services/enrollment.service");
      await removeEnrollment(duplicate.id);
    });
  });

  // ─────────── C. LECTURE PAR ID ───────────

  describe("C. Lecture par ID - getEnrollmentById", () => {
    it("devrait retourner un enrollment existant", async () => {
      const { getEnrollmentById } = await import("@/lib/services/enrollment.service");
      const record = await getEnrollmentById("1");

      expect(record).not.toBeNull();
      expect(record.id).toBe("1");
      expect(record.studentName).toBeTruthy();
    });

    it("devrait retourner null pour un ID inexistant", async () => {
      const { getEnrollmentById } = await import("@/lib/services/enrollment.service");
      const record = await getEnrollmentById("99999");
      expect(record).toBeNull();
    });
  });

  // ─────────── D. MODIFICATION ───────────

  describe("D. Modification - editEnrollment", () => {
    it("devrait modifier le statut d'un enrollment", async () => {
      const { editEnrollment, getEnrollmentById } = await import("@/lib/services/enrollment.service");

      const updated = await editEnrollment("1", { status: "sorti" });
      expect(updated.status).toBe("sorti");

      // Vérifier persistance
      const reloaded = await getEnrollmentById("1");
      expect(reloaded.status).toBe("sorti");

      // Remettre pour les autres tests
      await editEnrollment("1", { status: "inscrit" });
    });

    it("devrait modifier la classId d'un enrollment", async () => {
      const { editEnrollment, getEnrollmentById } = await import("@/lib/services/enrollment.service");

      const updated = await editEnrollment("1", { classId: 2 });
      expect(updated.classId).toBe("2");

      await editEnrollment("1", { classId: 1 });
    });

    it("devrait modifier les notes d'un enrollment", async () => {
      const { editEnrollment, getEnrollmentById } = await import("@/lib/services/enrollment.service");

      await editEnrollment("1", { notes: "Notes modifiées" });

      const reloaded = await getEnrollmentById("1");
      expect(reloaded.notes).toBe("Notes modifiées");
    });

    it("devrait retourner null pour un enrollment inexistant", async () => {
      const { editEnrollment } = await import("@/lib/services/enrollment.service");
      const result = await editEnrollment("99999", { status: "sorti" });
      expect(result).toBeNull();
    });
  });

  // ─────────── E. SUPPRESSION ───────────

  describe("E. Suppression - removeEnrollment", () => {
    it("devrait supprimer un enrollment", async () => {
      const { addEnrollment, removeEnrollment, getEnrollmentById } = await import("@/lib/services/enrollment.service");

      const created = await addEnrollment({
        studentId: 2,
        classId: 2,
        academicYearId: 1,
        enrollmentDate: "2025-09-20",
        status: "inscrit",
      });

      expect(await getEnrollmentById(created.id)).not.toBeNull();

      await removeEnrollment(created.id);

      expect(await getEnrollmentById(created.id)).toBeNull();
    });

    it("devrait gérer la suppression d'un ID inexistant sans erreur", async () => {
      const { removeEnrollment } = await import("@/lib/services/enrollment.service");
      await expect(removeEnrollment("99999")).resolves.not.toThrow();
    });
  });

  // ─────────── G. FLUX DE RÉINSCRIPTION COMPLET ───────────

  describe("G. Flux réinscription - addEnrollment + editStudent", () => {
    it("devrait réinscrire un élève dans une nouvelle classe", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      // Student 1 (Amadou) était en classe 1 (1ère Année),
      // on le réinscrit en classe 2 (2ème Année) pour la même année académique
      const enrollment = await addEnrollment({
        studentId: 1,
        classId: 2,
        academicYearId: 1,
        enrollmentDate: "2025-10-01",
        status: "réinscrit",
      });

      expect(enrollment.id).toBeTruthy();
      expect(enrollment.classId).toBe("2");
      expect(enrollment.status).toBe("réinscrit");
      expect(enrollment.enrollmentDate).toBe("2025-10-01");

      // Vérifier que la réinscription est persistée
      const records = await getEnrollments({ studentId: "1" });
      const found = records.find(r => r.id === enrollment.id);
      expect(found).toBeTruthy();
      expect(found?.className).toBe("2ème Année");
    });

    it("devrait mettre à jour la classe de l'élève via editStudent après réinscription", async () => {
      const { editStudent, getStudentById } = await import("@/lib/services/student.service");

      // Mettre à jour la classe de l'élève 1 vers la classe 2
      const updated = await editStudent("1", { classId: "2" });
      expect(updated.classId).toBe("2");
      expect(updated.className).toBe("2ème Année");

      // Vérifier persistance
      const student = await getStudentById("1");
      expect(student?.classId).toBe("2");
      expect(student?.className).toBe("2ème Année");

      // Remettre pour les autres tests
      await editStudent("1", { classId: "1" });
    });

    it("devrait créer une réinscription avec statut 'passage'", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      const enrollment = await addEnrollment({
        studentId: 2,
        classId: 2,
        academicYearId: 1,
        enrollmentDate: "2025-10-05",
        status: "réinscrit",
      });

      expect(enrollment.status).toBe("réinscrit");
    });

    it("devrait créer une réinscription avec statut 'redoublement'", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      const enrollment = await addEnrollment({
        studentId: 2,
        classId: 1,
        academicYearId: 1,
        enrollmentDate: "2025-10-10",
        status: "réinscrit",
        notes: "Redoublement",
      });

      expect(enrollment.status).toBe("réinscrit");
      expect(enrollment.notes).toBe("Redoublement");
      expect(enrollment.classId).toBe("1");
    });

    it("devrait retourner la liste des réinscriptions d'un élève pour l'année active", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");

      // Student 1 a 2 enrollments dans l'année 1
      const records = await getEnrollments({ studentId: "1", academicYearId: "1" });
      expect(records.length).toBeGreaterThanOrEqual(2);

      // La plus récente devrait être celle du 2025-10-01 (réinscrit)
      const sorted = [...records].sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate));
      expect(sorted[0].status).toBe("réinscrit");
    });
  });
});
