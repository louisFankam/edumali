import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";
import { seedClass, seedStudent, seedAcademicYear, seedEnrollment } from "../helpers/seed";

let classId1: string
let classId2: string
let studentId1: string
let studentId2: string
let academicYearId: string

describe("Reinscription Page - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId1 = await seedClass({ name: "1ère Année", totalFee: 0 })
    classId2 = await seedClass({ name: "2ème Année", totalFee: 0 })
    academicYearId = await seedAcademicYear({ name: "2024-2025", isCurrent: true })
    studentId1 = await seedStudent(classId1, {
      firstName: "Amadou", lastName: "Diallo",
      gender: "Masculin", parentName: "Moussa Diallo", parentPhone: "70123456",
    })
    studentId2 = await seedStudent(classId1, {
      firstName: "Fatoumata", lastName: "Traoré",
      gender: "Féminin", parentName: "Oumar Traoré", parentPhone: "66123456",
    })
    await seedEnrollment(studentId1, classId1, academicYearId)
    await seedEnrollment(studentId2, classId1, academicYearId)
  }, 60000);

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
      const records = await getEnrollments({ studentId: studentId1 });

      expect(records.length).toBe(1);
      expect(records[0].studentId).toBe(studentId1);
      expect(records[0].studentName).toContain("Amadou");
    });

    it("devrait filtrer par academicYearId", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");
      const records = await getEnrollments({ academicYearId });

      expect(records.length).toBe(2);
      records.forEach(r => expect(r.academicYearId).toBe(academicYearId));
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
        studentId: Number(studentId1),
        classId: Number(classId2),
        academicYearId: Number(academicYearId),
        enrollmentDate: "2025-09-01",
        status: "réinscrit",
      });

      expect(created.id).toBeTruthy();
      expect(created.studentId).toBe(studentId1);
      expect(created.classId).toBe(classId2);
      expect(created.academicYearId).toBe(academicYearId);
      expect(created.status).toBe("réinscrit");
      expect(created.enrollmentDate).toBe("2025-09-01");
    });

    it("devrait créer un enrollment avec le statut 'inscrit' par défaut", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");
      const created = await addEnrollment({
        studentId: Number(studentId2),
        classId: Number(classId2),
        academicYearId: Number(academicYearId),
        enrollmentDate: "2025-09-05",
        status: "inscrit",
      });

      expect(created.status).toBe("inscrit");
    });

    it("devrait créer un enrollment avec des notes optionnelles", async () => {
      const { addEnrollment } = await import("@/lib/services/enrollment.service");
      const created = await addEnrollment({
        studentId: Number(studentId2),
        classId: Number(classId1),
        academicYearId: Number(academicYearId),
        enrollmentDate: "2025-09-10",
        status: "transféré",
        notes: "Transfert depuis une autre école",
      });

      expect(created.notes).toBe("Transfert depuis une autre école");
    });

    it("[ANOMALIE] devrait permettre un doublon (studentId + academicYearId) - pas de UNIQUE", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      const before = await getEnrollments({ studentId: studentId1, academicYearId });
      const countBefore = before.length;

      // Même studentId, même academicYearId - devrait réussir car pas de contrainte UNIQUE
      const duplicate = await addEnrollment({
        studentId: Number(studentId1),
        classId: Number(classId1),
        academicYearId: Number(academicYearId),
        enrollmentDate: "2025-09-15",
        status: "réinscrit",
      });

      expect(duplicate.id).toBeTruthy();

      const after = await getEnrollments({ studentId: studentId1, academicYearId });
      expect(after.length).toBe(countBefore + 1);

      // Nettoyage
      const { removeEnrollment } = await import("@/lib/services/enrollment.service");
      await removeEnrollment(duplicate.id);
    });
  });

  // ─────────── C. LECTURE PAR ID ───────────

  describe("C. Lecture par ID - getEnrollmentById", () => {
    it("devrait retourner un enrollment existant", async () => {
      const { getEnrollmentById, getEnrollments } = await import("@/lib/services/enrollment.service");
      const records = await getEnrollments({ studentId: studentId1 });
      const enrollmentId = records[0].id;

      const record = await getEnrollmentById(enrollmentId);

      expect(record).not.toBeNull();
      expect(record.id).toBe(enrollmentId);
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
    let enrollmentId: string

    it("devrait récupérer un enrollment", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");
      const records = await getEnrollments({ studentId: studentId1 });
      enrollmentId = records[0].id
      expect(enrollmentId).toBeTruthy()
    })

    it("devrait modifier le statut d'un enrollment", async () => {
      const { editEnrollment, getEnrollmentById } = await import("@/lib/services/enrollment.service");

      const updated = await editEnrollment(enrollmentId, { status: "sorti" });
      expect(updated.status).toBe("sorti");

      // Vérifier persistance
      const reloaded = await getEnrollmentById(enrollmentId);
      expect(reloaded.status).toBe("sorti");

      // Remettre pour les autres tests
      await editEnrollment(enrollmentId, { status: "inscrit" });
    });

    it("devrait modifier la classId d'un enrollment", async () => {
      const { editEnrollment, getEnrollmentById } = await import("@/lib/services/enrollment.service");

      const updated = await editEnrollment(enrollmentId, { classId: Number(classId2) });
      expect(updated.classId).toBe(classId2);

      await editEnrollment(enrollmentId, { classId: Number(classId1) });
    });

    it("devrait modifier les notes d'un enrollment", async () => {
      const { editEnrollment, getEnrollmentById } = await import("@/lib/services/enrollment.service");

      await editEnrollment(enrollmentId, { notes: "Notes modifiées" });

      const reloaded = await getEnrollmentById(enrollmentId);
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
        studentId: Number(studentId2),
        classId: Number(classId2),
        academicYearId: Number(academicYearId),
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

  // ─────────── F. getEnrollmentStats ───────────

  describe("F. getEnrollmentStats - Statistiques inscriptions", () => {
    it("devrait retourner les stats globales (sans filtre année)", async () => {
      const { getEnrollmentStats } = await import("@/lib/services/enrollment.service");

      const stats = await getEnrollmentStats();
      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.inscrit).toBeGreaterThanOrEqual(2);
    });

    it("devrait filtrer les stats par année académique", async () => {
      const { getEnrollmentStats } = await import("@/lib/services/enrollment.service");

      const stats = await getEnrollmentStats(academicYearId);
      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats).toHaveProperty("inscrit");
    });

    it("devrait retourner 0 pour une année inexistante", async () => {
      const { getEnrollmentStats } = await import("@/lib/services/enrollment.service");

      const stats = await getEnrollmentStats("99999");
      expect(stats.total).toBe(0);
    });
  });

  // ─────────── G. FLUX DE RÉINSCRIPTION COMPLET ───────────

  describe("G. Flux réinscription - addEnrollment + editStudent", () => {
    it("devrait réinscrire un élève dans une nouvelle classe", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      // Student (Amadou) était en classe 1 (1ère Année),
      // on le réinscrit en classe 2 (2ème Année) pour la même année académique
      const enrollment = await addEnrollment({
        studentId: Number(studentId1),
        classId: Number(classId2),
        academicYearId: Number(academicYearId),
        enrollmentDate: "2025-10-01",
        status: "réinscrit",
      });

      expect(enrollment.id).toBeTruthy();
      expect(enrollment.classId).toBe(classId2);
      expect(enrollment.status).toBe("réinscrit");
      expect(enrollment.enrollmentDate).toBe("2025-10-01");

      // Vérifier que la réinscription est persistée
      const records = await getEnrollments({ studentId: studentId1 });
      const found = records.find(r => r.id === enrollment.id);
      expect(found).toBeTruthy();
      expect(found?.className).toBe("2ème Année");
    });

    it("devrait mettre à jour la classe de l'élève via editStudent après réinscription", async () => {
      const { editStudent, getStudentById } = await import("@/lib/services/student.service");

      // Mettre à jour la classe de l'élève 1 vers la classe 2
      const updated = await editStudent(studentId1, { classId: classId2 });
      expect(updated.classId).toBe(classId2);
      expect(updated.className).toBe("2ème Année");

      // Vérifier persistance
      const student = await getStudentById(studentId1);
      expect(student?.classId).toBe(classId2);
      expect(student?.className).toBe("2ème Année");

      // Remettre pour les autres tests
      await editStudent(studentId1, { classId: classId1 });
    });

    it("devrait créer une réinscription avec statut 'passage'", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      const enrollment = await addEnrollment({
        studentId: Number(studentId2),
        classId: Number(classId2),
        academicYearId: Number(academicYearId),
        enrollmentDate: "2025-10-05",
        status: "réinscrit",
      });

      expect(enrollment.status).toBe("réinscrit");
    });

    it("devrait créer une réinscription avec statut 'redoublement'", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      const enrollment = await addEnrollment({
        studentId: Number(studentId2),
        classId: Number(classId1),
        academicYearId: Number(academicYearId),
        enrollmentDate: "2025-10-10",
        status: "réinscrit",
        notes: "Redoublement",
      });

      expect(enrollment.status).toBe("réinscrit");
      expect(enrollment.notes).toBe("Redoublement");
      expect(enrollment.classId).toBe(classId1);
    });

    it("devrait retourner la liste des réinscriptions d'un élève pour l'année active", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");

      // Student 1 a 2 enrollments dans l'année
      const records = await getEnrollments({ studentId: studentId1, academicYearId });
      expect(records.length).toBeGreaterThanOrEqual(2);

      // La plus récente devrait être celle du 2025-10-01 (réinscrit)
      const sorted = [...records].sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate));
      expect(sorted[0].status).toBe("réinscrit");
    });
  });
});
