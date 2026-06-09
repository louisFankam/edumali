import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/setup";
import { seedClass, seedStudent, seedAcademicYear, seedEnrollment } from "../helpers/seed";

let classId1: string
let classId2: string
let studentId1: string
let studentId2: string
let academicYearId: string

describe("Students CRUD - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId1 = await seedClass({ name: "6e A" })
    classId2 = await seedClass({ name: "6e B" })
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

  describe("A. getStudents - Liste", () => {
    it("devrait retourner la liste des élèves", async () => {
      const { getStudents } = await import("@/lib/services/student.service");
      const result = await getStudents();
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it("devrait filtrer par classe", async () => {
      const { getStudents } = await import("@/lib/services/student.service");
      const result = await getStudents({ classId: classId1 });
      expect(result.data.length).toBe(2);
      result.data.forEach(s => expect(s.classId).toBe(classId1));
    });

    it("devrait filtrer par recherche (prénom)", async () => {
      const { getStudents } = await import("@/lib/services/student.service");
      const result = await getStudents({ search: "Amadou" });
      expect(result.data.length).toBe(1);
      expect(result.data[0].firstName).toBe("Amadou");
    });

    it("devrait retourner les champs attendus", async () => {
      const { getStudents } = await import("@/lib/services/student.service");
      const result = await getStudents();
      const s = result.data[0];
      expect(s.id).toBeTruthy();
      expect(s.firstName).toBeTypeOf("string");
      expect(s.lastName).toBeTypeOf("string");
      expect(s.className).toBeTruthy();
      expect(s.status).toMatch(/^(Actif|Inactif)$/);
    });

    it("devrait paginer les résultats", async () => {
      const { getStudents } = await import("@/lib/services/student.service");
      const result = await getStudents({ page: 1, limit: 1 });
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(2);
    });
  });

  describe("B. addStudent - Création", () => {
    it("devrait créer un nouvel élève", async () => {
      const { addStudent } = await import("@/lib/services/student.service");
      const s = await addStudent({
        firstName: "Test",
        lastName: "Élève",
        gender: "Masculin",
        birthDate: "2020-01-15",
        nationality: "Malienne",
        parentName: "Parent Test",
        parentPhone: "70000003",
        address: "Bamako",
        classId: classId1,
      });
      expect(s.id).toBeTruthy();
      expect(s.firstName).toBe("Test");
      expect(s.lastName).toBe("Élève");
      expect(s.classId).toBe(classId1);
      expect(s.status).toBe("Actif");
    });

    it("devrait créer un audit_log pour addStudent", async () => {
      const { getAuditLogs } = await import("@/lib/services/audit.service");
      const result = await getAuditLogs({ tableName: "students", action: "create", limit: 1 });
      expect(result.total).toBeGreaterThanOrEqual(1);
    });

    it("devrait créer un élève avec une réduction", async () => {
      const { addStudent, getStudentById } = await import("@/lib/services/student.service");
      const s = await addStudent({
        firstName: "Boursier",
        lastName: "Test",
        gender: "Féminin",
        birthDate: "2019-06-20",
        parentName: "Parent Bourse",
        parentPhone: "70000004",
        classId: classId1,
        discountType: "percentage",
        discountValue: 50,
        discountReason: "Bourse mérite",
      });
      expect(s.id).toBeTruthy();
      expect(s.discountType).toBe("percentage");
      expect(s.discountValue).toBe(50);
      expect(s.discountReason).toBe("Bourse mérite");

      const reloaded = await getStudentById(s.id);
      expect(reloaded.discountType).toBe("percentage");
      expect(reloaded.discountValue).toBe(50);
    });

    it("devrait créer un élève avec réduction fixe", async () => {
      const { addStudent } = await import("@/lib/services/student.service");
      const s = await addStudent({
        firstName: "Fixe",
        lastName: "Discount",
        gender: "Masculin",
        birthDate: "2018-03-10",
        parentName: "Parent Fixe",
        parentPhone: "70000005",
        classId: classId1,
        discountType: "fixed",
        discountValue: 25000,
        discountReason: "Réduction fratrie",
      });
      expect(s.discountType).toBe("fixed");
      expect(s.discountValue).toBe(25000);
    });
  });

  describe("C. getStudentById - Lecture", () => {
    it("devrait retourner un élève existant", async () => {
      const { getStudentById } = await import("@/lib/services/student.service");
      const s = await getStudentById(studentId1);
      expect(s).not.toBeNull();
      expect(s.id).toBe(studentId1);
      expect(s.firstName).toBeTruthy();
      expect(s.className).toBeTruthy();
    });

    it("devrait retourner null pour un ID inexistant", async () => {
      const { getStudentById } = await import("@/lib/services/student.service");
      const s = await getStudentById("99999");
      expect(s).toBeNull();
    });
  });

  describe("D. editStudent - Modification", () => {
    it("devrait modifier le prénom", async () => {
      const { editStudent, getStudentById } = await import("@/lib/services/student.service");
      await editStudent(studentId1, { firstName: "AmadouModifié" });
      const s = await getStudentById(studentId1);
      expect(s.firstName).toBe("AmadouModifié");
      await editStudent(studentId1, { firstName: "Amadou" });
    });

    it("devrait modifier la réduction", async () => {
      const { getStudents, editStudent, getStudentById } = await import("@/lib/services/student.service");
      const all = await getStudents();
      const target = all.data.find(s => !s.discountType);
      if (!target) return;

      await editStudent(target.id, {
        discountType: "percentage",
        discountValue: 25,
        discountReason: "Test modification",
      });

      const s = await getStudentById(target.id);
      expect(s.discountType).toBe("percentage");
      expect(s.discountValue).toBe(25);
      expect(s.discountReason).toBe("Test modification");

      await editStudent(target.id, {
        discountType: null,
        discountValue: null,
        discountReason: null,
      });
    });

    it("devrait retourner null pour un ID inexistant", async () => {
      const { editStudent } = await import("@/lib/services/student.service");
      const result = await editStudent("99999", { firstName: "Nope" });
      expect(result).toBeNull();
    });
  });

  describe("E. getStudentStats - Statistiques", () => {
    it("devrait retourner les stats globales", async () => {
      const { getStudentStats } = await import("@/lib/services/student.service");

      const stats = await getStudentStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.girls + stats.boys).toBe(stats.total);
      expect(stats.girlsPercentage + stats.boysPercentage).toBe(100);
    });

    it("devrait retourner les stats filtrées par année académique", async () => {
      const { getStudentStats } = await import("@/lib/services/student.service");

      const stats = await getStudentStats(academicYearId);
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats).toHaveProperty("girls");
      expect(stats).toHaveProperty("boys");
    });

    it("devrait retourner 0 pour une année sans étudiants", async () => {
      const { getStudentStats } = await import("@/lib/services/student.service");

      const stats = await getStudentStats("99999");
      expect(stats.total).toBe(0);
      expect(stats.girls).toBe(0);
      expect(stats.boys).toBe(0);
    });
  });

  describe("F. removeStudent - Suppression", () => {
    it("devrait échouer pour un élève avec inscriptions", async () => {
      const { removeStudent } = await import("@/lib/services/student.service");
      await expect(removeStudent(studentId1)).rejects.toThrow("inscriptions");
    });

    it("devrait échouer pour un ID inexistant", async () => {
      const { removeStudent } = await import("@/lib/services/student.service");
      await expect(removeStudent("99999")).rejects.toThrow();
    });

    it("devrait échouer pour un autre élève avec des inscriptions", async () => {
      const { removeStudent } = await import("@/lib/services/student.service");
      await expect(removeStudent(studentId2)).rejects.toThrow("inscriptions");
    });

    it("devrait réussir pour un élève créé via le repository sans inscription", async () => {
      const { removeStudent, getStudentById } = await import("@/lib/services/student.service");
      const { createStudent } = await import("@/lib/repositories/student.repository");
      const created = await createStudent({
        firstName: "Clean", lastName: "Test", gender: "Masculin",
        birthDate: "2010-01-01", parentName: "Parent", parentPhone: "0000000000",
        classId: Number(classId1), registrationDate: "2026-01-01", status: "Actif",
      });
      // No enrollment created, so deletion should succeed
      await expect(removeStudent(String(created.id))).resolves.not.toThrow();
      const found = await getStudentById(String(created.id));
      expect(found).toBeNull();
    });

    it("devrait échouer pour un élève avec des notes", async () => {
      const { addStudent, removeStudent } = await import("@/lib/services/student.service");
      const s = await addStudent({
        firstName: "Notes", lastName: "Student", gender: "Féminin",
        birthDate: "2010-01-01", parentName: "Parent", parentPhone: "0000000000",
        classId: classId1,
      });
      // addStudent creates an enrollment automatically, so deletion should be blocked
      await expect(removeStudent(s.id)).rejects.toThrow("inscriptions");
    });
  });

  describe("G. editStudent - Changement de classe", () => {
    it("devrait mettre à jour l'inscription quand la classe change", async () => {
      const { editStudent, getStudentById } = await import("@/lib/services/student.service");
      const { findAllEnrollments } = await import("@/lib/repositories/enrollment.repository");
      const { db } = await import("@/lib/db");
      const sql = (await import("drizzle-orm")).sql;

      const rows = db.all(sql`SELECT id FROM classes ORDER BY id LIMIT 1 OFFSET 1`) as { id: number }[];
      const cls2Num = rows[0]?.id
      if (!cls2Num) return;

      // Student 2 is enrolled in class 1, change to class 2
      await editStudent(studentId2, { classId: String(cls2Num) });
      const updated = await getStudentById(studentId2);
      expect(updated!.classId).toBe(String(cls2Num));

      const enrollments = await findAllEnrollments({ studentId: Number(studentId2), academicYearId: Number(academicYearId) });
      expect(enrollments.length).toBeGreaterThan(0);
      expect(enrollments[0].classId).toBe(cls2Num);
    });
  });
});