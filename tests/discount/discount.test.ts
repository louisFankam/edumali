import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";

describe("Discount/Réduction - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("A. Création d'étudiants avec réduction", () => {
    it("devrait créer un étudiant avec réduction percentage", async () => {
      const { addStudent, getStudentById } = await import("@/lib/services/student.service");
      const s = await addStudent({
        firstName: "Pct",
        lastName: "Discount",
        gender: "Masculin",
        birthDate: "2018-01-01",
        parentName: "Parent Pct",
        parentPhone: "70000100",
        classId: "1",
        discountType: "percentage",
        discountValue: 25,
        discountReason: "Test 25%",
      });
      expect(s.discountType).toBe("percentage");
      expect(s.discountValue).toBe(25);
      expect(s.discountReason).toBe("Test 25%");

      const loaded = await getStudentById(s.id);
      expect(loaded.discountType).toBe("percentage");
      expect(loaded.discountValue).toBe(25);
    });

    it("devrait créer un étudiant avec réduction fixe", async () => {
      const { addStudent } = await import("@/lib/services/student.service");
      const s = await addStudent({
        firstName: "Fixe",
        lastName: "Reduc",
        gender: "Féminin",
        birthDate: "2017-05-15",
        parentName: "Parent Fixe",
        parentPhone: "70000101",
        classId: "1",
        discountType: "fixed",
        discountValue: 30000,
        discountReason: "Fratrie",
      });
      expect(s.discountType).toBe("fixed");
      expect(s.discountValue).toBe(30000);
    });

    it("devrait créer un étudiant sans réduction", async () => {
      const { addStudent } = await import("@/lib/services/student.service");
      const s = await addStudent({
        firstName: "Normal",
        lastName: "NoDisc",
        gender: "Masculin",
        birthDate: "2019-08-20",
        parentName: "Parent Normal",
        parentPhone: "70000102",
        classId: "1",
      });
      expect(s.discountType).toBeNull();
      expect(s.discountValue).toBeNull();
    });
  });

  describe("B. Modification de réduction", () => {
    it("devrait modifier la réduction d'un étudiant existant", async () => {
      const { addStudent, editStudent, getStudentById } = await import("@/lib/services/student.service");

      const s = await addStudent({
        firstName: "Modif",
        lastName: "Discount",
        gender: "Masculin",
        birthDate: "2018-01-01",
        parentName: "Parent",
        parentPhone: "70000103",
        classId: "1",
      });

      expect(s.discountType).toBeNull();

      await editStudent(s.id, {
        discountType: "fixed",
        discountValue: 15000,
        discountReason: "Ajouté après inscription",
      });

      const loaded = await getStudentById(s.id);
      expect(loaded.discountType).toBe("fixed");
      expect(loaded.discountValue).toBe(15000);
      expect(loaded.discountReason).toBe("Ajouté après inscription");
    });

    it("devrait supprimer la réduction en passant null", async () => {
      const { addStudent, editStudent, getStudentById } = await import("@/lib/services/student.service");

      const s = await addStudent({
        firstName: "Suppr",
        lastName: "Reduc",
        gender: "Féminin",
        birthDate: "2018-06-01",
        parentName: "Parent",
        parentPhone: "70000104",
        classId: "1",
        discountType: "percentage",
        discountValue: 50,
        discountReason: "Bourse",
      });

      await editStudent(s.id, {
        discountType: null,
        discountValue: null,
        discountReason: null,
      });

      const loaded = await getStudentById(s.id);
      expect(loaded.discountType).toBeNull();
      expect(loaded.discountValue).toBeNull();
    });
  });

  describe("C. Calcul des impayés avec réduction", () => {
    it("devrait calculer netFee = totalFee - discount pour percentage", async () => {
      const { addStudent } = await import("@/lib/services/student.service");
      const { addPayment, getUnpaidStudents } = await import("@/lib/services/payment.service");
      const { db } = await import("@/lib/db");
      const { classes } = await import("@/lib/models/schema");
      const { eq } = await import("drizzle-orm");

      await db.update(classes).set({ totalFee: 100000 }).where(eq(classes.id, 1));

      const s = await addStudent({
        firstName: "Unpaid",
        lastName: "Pct",
        gender: "Masculin",
        birthDate: "2018-01-01",
        parentName: "Parent",
        parentPhone: "70000105",
        classId: "1",
        discountType: "percentage",
        discountValue: 25,
        discountReason: "Test impayés",
      });

      await addPayment({ studentId: Number(s.id), amount: 50000, method: "espèces", date: "2025-10-01" });

      const result = await getUnpaidStudents({ academicYearId: "1" });
      const found = result.data.find(u => u.id === s.id);
      expect(found).toBeTruthy();
      expect(found!.totalFee).toBe(100000);
      expect(found!.discountType).toBe("percentage");
      expect(found!.discountValue).toBe(25);
      expect(found!.netFee).toBe(75000);
      expect(found!.totalPaid).toBe(50000);
      expect(found!.remaining).toBe(25000);
    });

    it("devrait calculer netFee = totalFee - discount pour fixed", async () => {
      const { addStudent } = await import("@/lib/services/student.service");
      const { addPayment, getUnpaidStudents } = await import("@/lib/services/payment.service");
      const { db } = await import("@/lib/db");
      const { classes } = await import("@/lib/models/schema");
      const { eq } = await import("drizzle-orm");

      await db.update(classes).set({ totalFee: 100000 }).where(eq(classes.id, 1));

      const s = await addStudent({
        firstName: "Unpaid",
        lastName: "Fixed",
        gender: "Féminin",
        birthDate: "2018-01-01",
        parentName: "Parent",
        parentPhone: "70000106",
        classId: "1",
        discountType: "fixed",
        discountValue: 30000,
        discountReason: "Test fixe",
      });

      await addPayment({ studentId: Number(s.id), amount: 70000, method: "espèces", date: "2025-10-01" });

      const result = await getUnpaidStudents({ academicYearId: "1" });
      const found = result.data.find(u => u.id === s.id);
      expect(found).toBeUndefined();
    });

    it("ne devrait pas appliquer de réduction si discountType est null", async () => {
      const { addStudent } = await import("@/lib/services/student.service");
      const { getUnpaidStudents } = await import("@/lib/services/payment.service");

      const s = await addStudent({
        firstName: "No",
        lastName: "Discount",
        gender: "Masculin",
        birthDate: "2018-01-01",
        parentName: "Parent",
        parentPhone: "70000107",
        classId: "1",
      });

      const result = await getUnpaidStudents({ academicYearId: "1" });
      const found = result.data.find(u => u.id === s.id);
      expect(found).toBeTruthy();
      expect(found!.discountType).toBeNull();
      expect(found!.discountValue).toBeNull();
      expect(found!.netFee).toBe(100000);
      expect(found!.remaining).toBe(100000);
    });
  });
});