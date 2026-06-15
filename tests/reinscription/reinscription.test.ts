import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";
import { seedClass, seedStudent, seedAcademicYear, seedEnrollment } from "../helpers/seed";

let classId1: string
let classId2: string
let classCapacity1: string
let studentId1: string
let studentId2: string
let academicYearId: string
let newAcademicYearId: string
let fluxYearId: string

describe("Reinscription Page - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId1 = await seedClass({ name: "1ère Année", totalFee: 0, level: 1 })
    classId2 = await seedClass({ name: "2ème Année", totalFee: 0, level: 2 })
    classCapacity1 = await seedClass({ name: "Classe saturée", totalFee: 0, capacity: 1 })
    academicYearId = await seedAcademicYear({ name: "2024-2025", isCurrent: true })
    newAcademicYearId = await seedAcademicYear({ name: "2025-2026", isCurrent: false })
    fluxYearId = await seedAcademicYear({ name: "2026-2027", isCurrent: false })
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
    it("devrait créer un nouvel enrollment dans une nouvelle année", async () => {
      const { addEnrollment } = await import("@/lib/services/enrollment.service");
      const created = await addEnrollment({
        studentId: Number(studentId1),
        classId: Number(classId2),
        academicYearId: Number(newAcademicYearId),
        enrollmentDate: "2025-09-01",
        status: "réinscrit",
      });

      expect(created.id).toBeTruthy();
      expect(created.studentId).toBe(studentId1);
      expect(created.classId).toBe(classId2);
      expect(created.academicYearId).toBe(newAcademicYearId);
      expect(created.status).toBe("réinscrit");
      expect(created.enrollmentDate).toBe("2025-09-01");
    });

    it("devrait créer un audit_log pour addEnrollment", async () => {
      const { getAuditLogs } = await import("@/lib/services/audit.service");
      const result = await getAuditLogs({ tableName: "enrollments", action: "create", limit: 1 });
      expect(result.total).toBeGreaterThanOrEqual(1);
    });

    it("devrait créer un enrollment avec le statut 'inscrit' et notes", async () => {
      const { addEnrollment } = await import("@/lib/services/enrollment.service");
      const created = await addEnrollment({
        studentId: Number(studentId2),
        classId: Number(classId2),
        academicYearId: Number(newAcademicYearId),
        enrollmentDate: "2025-09-05",
        status: "inscrit",
        notes: "Nouvel élève",
      });

      expect(created.status).toBe("inscrit");
      expect(created.notes).toBe("Nouvel élève");
    });

    it("devrait REJETER un doublon (studentId + academicYearId)", async () => {
      const { addEnrollment } = await import("@/lib/services/enrollment.service");

      // studentId1 a déjà un enrollment pour academicYearId (seed)
      // Essayer d'en créer un autre doit échouer
      await expect(addEnrollment({
        studentId: Number(studentId1),
        classId: Number(classId1),
        academicYearId: Number(academicYearId),
        enrollmentDate: "2025-09-15",
        status: "réinscrit",
      })).rejects.toThrow(" déjà inscrit ");
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

      const reloaded = await getEnrollmentById(enrollmentId);
      expect(reloaded.status).toBe("sorti");

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
      const { seedStudent } = await import("../helpers/seed");

      // Créer un élève temporaire avec un enrollment unique pour le test de suppression
      const tmpStudent = await seedStudent(classId1, { firstName: "Temp", lastName: "Delete" });

      const created = await addEnrollment({
        studentId: Number(tmpStudent),
        classId: Number(classId2),
        academicYearId: Number(newAcademicYearId),
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
      expect(stats.total).toBeGreaterThanOrEqual(4);
      expect(stats.inscrit).toBeGreaterThanOrEqual(4);
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

  describe("G. Flux réinscription - addEnrollment + editStudent (année 2026-2027)", () => {
    it("devrait réinscrire un élève dans une nouvelle classe pour l'année suivante", async () => {
      const { addEnrollment, getEnrollments } = await import("@/lib/services/enrollment.service");

      // Student (Amadou) était en classe 1 (1ère Année) en 2024-2025,
      // on le réinscrit en classe 2 (2ème Année) pour l'année 2026-2027
      const enrollment = await addEnrollment({
        studentId: Number(studentId1),
        classId: Number(classId2),
        academicYearId: Number(fluxYearId),
        enrollmentDate: "2026-10-01",
        status: "réinscrit",
      });

      expect(enrollment.id).toBeTruthy();
      expect(enrollment.classId).toBe(classId2);
      expect(enrollment.status).toBe("réinscrit");
      expect(enrollment.enrollmentDate).toBe("2026-10-01");

      const records = await getEnrollments({ studentId: studentId1 });
      const found = records.find(r => r.id === enrollment.id);
      expect(found).toBeTruthy();
      expect(found?.className).toBe("2ème Année");
    });

    it("devrait mettre à jour la classe de l'élève via editStudent sans écraser l'enrollment", async () => {
      const { editStudent, getStudentById } = await import("@/lib/services/student.service");
      const { getEnrollments } = await import("@/lib/services/enrollment.service");

      // Mettre à jour la classe de l'élève 1 vers la classe 2
      const updated = await editStudent(studentId1, { classId: classId2 });
      expect(updated.classId).toBe(classId2);
      expect(updated.className).toBe("2ème Année");

      // Vérifier que l'enrollment pour 2026-2027 n'a PAS été modifié par editStudent
      const enrollmentRecords = await getEnrollments({ studentId: studentId1, academicYearId: fluxYearId });
      expect(enrollmentRecords.length).toBe(1);
      expect(enrollmentRecords[0].classId).toBe(classId2); // inchangé car déjà correct

      // Remettre pour les autres tests
      await editStudent(studentId1, { classId: classId1 });
    });

    it("devrait créer une réinscription 'passage' pour un autre élève puis passer en 'redoublement'", async () => {
      const { addEnrollment, editEnrollment } = await import("@/lib/services/enrollment.service");

      const enrollment = await addEnrollment({
        studentId: Number(studentId2),
        classId: Number(classId2),
        academicYearId: Number(fluxYearId),
        enrollmentDate: "2026-10-05",
        status: "réinscrit",
      });

      expect(enrollment.status).toBe("réinscrit");

      // Passer en redoublement dans la même année en modifiant l'enrollment
      const updated = await editEnrollment(enrollment.id, {
        classId: Number(classId1),
        notes: "Redoublement",
      });

      expect(updated.classId).toBe(classId1);
      expect(updated.notes).toBe("Redoublement");
    });

    it("devrait REJETER une inscription si la capacité de la classe est dépassée", async () => {
      const { addEnrollment } = await import("@/lib/services/enrollment.service");
      const { seedStudent: seedStu } = await import("../helpers/seed");

      // classCapacity1 a capacity=1, déjà 0 élève inscrit pour fluxYearId
      const st1 = await seedStu(classId1, { firstName: "Cap1", lastName: "Test" });
      await addEnrollment({
        studentId: Number(st1),
        classId: Number(classCapacity1),
        academicYearId: Number(fluxYearId),
        enrollmentDate: "2026-10-01",
        status: "inscrit",
      });

      // Tentative d'inscrire un 2e élève dans la même classe (capacité = 1)
      const st2 = await seedStu(classId1, { firstName: "Cap2", lastName: "Test" });
      await expect(addEnrollment({
        studentId: Number(st2),
        classId: Number(classCapacity1),
        academicYearId: Number(fluxYearId),
        enrollmentDate: "2026-10-02",
        status: "inscrit",
      })).rejects.toThrow("capacité maximale");
    });

    it("devrait retourner exactement 1 enrollment par élève pour une année donnée", async () => {
      const { getEnrollments } = await import("@/lib/services/enrollment.service");

      // Student 1 a exactement 1 enrollment dans 2026-2027 (pas de doublon possible)
      const records = await getEnrollments({ studentId: studentId1, academicYearId: fluxYearId });
      expect(records.length).toBe(1);
      expect(records[0].status).toBe("réinscrit");
    });
  });
});
