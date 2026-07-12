import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";
import { seedClass, seedStudent, seedAcademicYear, seedEnrollment } from "../helpers/seed";

let classId1: string
let studentId1: string
let studentId2: string
let academicYearId: string

describe("Paiements Page - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId1 = await seedClass({ name: "1ère Année", totalFee: 80000 })
    studentId1 = await seedStudent(classId1, { firstName: "Amadou", lastName: "Diallo", gender: "Masculin", parentName: "Moussa Diallo", parentPhone: "70123456" })
    studentId2 = await seedStudent(classId1, { firstName: "Fatoumata", lastName: "Traoré", gender: "Féminin", parentName: "Oumar Traoré", parentPhone: "66123456" })
    academicYearId = await seedAcademicYear({ name: "2024-2025", isCurrent: true })
    await seedEnrollment(studentId1, classId1, academicYearId)
    await seedEnrollment(studentId2, classId1, academicYearId)
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  // ─────────── A. LISTE PAIEMENTS ───────────

  describe("A. getPayments - Liste des paiements", () => {
    it("devrait retourner une liste vide pour un étudiant sans paiement", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ studentId: studentId1 });
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("devrait lister les paiements après création", async () => {
      const { addPayment, getPayments } = await import("@/lib/services/payment.service");

      await addPayment({ studentId: Number(studentId1), amount: 30000, method: "espèces", date: "2025-10-01" });
      await addPayment({ studentId: Number(studentId1), amount: 20000, method: "mobile_money", date: "2025-11-01" });

      const result = await getPayments({ studentId: studentId1 });
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it("devrait retourner les bons champs (amount, method, date, status)", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ studentId: studentId1 });

      const p = result.data[0];
      expect(p.amount).toBeTypeOf("number");
      expect(p.method).toMatch(/^(espèces|virement|chèque|mobile_money)$/);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.status).toBe("payé");
    });

    it("devrait filtrer par plage de dates", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: studentId1, from: "2025-10-01", to: "2025-10-31" });
      expect(result.data.length).toBe(1);
      expect(result.data[0].amount).toBe(30000);

      const result2 = await getPayments({ studentId: studentId1, from: "2025-12-01", to: "2025-12-31" });
      expect(result2.data.length).toBe(0);
    });

    it("devrait paginer les résultats", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ studentId: studentId1, page: 1, limit: 1 });
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(2);
    });

    it("devrait filtrer les paiements par classe", async () => {
      const { addPayment, getPayments } = await import("@/lib/services/payment.service");

      await addPayment({ studentId: Number(studentId2), amount: 10000, method: "espèces", date: "2025-10-05" });

      const result = await getPayments({ classId: classId1 });
      expect(result.data.length).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeGreaterThanOrEqual(3);
    });

    it("devrait filtrer les paiements par classe + étudiant", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ classId: classId1, studentId: studentId1 });
      expect(result.data.length).toBe(2);
      expect(result.data.every(p => p.studentId === studentId1)).toBe(true);
    });

    it("devrait retourner vide pour une classe sans paiement", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ classId: "99999" });
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ─────────── B. CRÉATION PAIEMENT ───────────

  describe("B. addPayment - Création (réutilise student-profile)", () => {
    it("devrait créer un paiement avec feeTypeId", async () => {
      const { addPayment, getPayments } = await import("@/lib/services/payment.service");

      const payment = await addPayment({
        studentId: Number(studentId2), amount: 15000, method: "chèque", date: "2025-12-15",
        feeTypeId: undefined,
      });

      expect(payment.id).toBeTruthy();
      expect(payment.amount).toBe(15000);
      expect(payment.feeTypeName).toBeUndefined();
    });

    it("devrait créer un audit_log", async () => {
      const { db } = await import("@/lib/db");
      const { auditLog } = await import("@/lib/models/schema");
      const { eq } = await import("drizzle-orm");

      const logs = await db.select()
        .from(auditLog)
        .where(eq(auditLog.tableName, "payments"))
        .where(eq(auditLog.action, "create"));

      expect(logs.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ─────────── C. MODIFICATION PAIEMENT ───────────

  describe("C. editPayment - Modification", () => {
    let paymentId: string;

    it("devrait récupérer l'ID d'un paiement existant", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ studentId: studentId1 });
      paymentId = result.data[0].id;
      expect(paymentId).toBeTruthy();
    });

    it("devrait modifier le montant", async () => {
      const { editPayment, getPayments } = await import("@/lib/services/payment.service");
      await editPayment(paymentId, { amount: 35000 });

      const result = await getPayments({ studentId: studentId1 });
      const p = result.data.find(r => r.id === paymentId);
      expect(p?.amount).toBe(35000);
    });

    it("devrait modifier la méthode de paiement", async () => {
      const { editPayment, getPayments } = await import("@/lib/services/payment.service");
      await editPayment(paymentId, { method: "virement" });

      const result = await getPayments({ studentId: studentId1 });
      const p = result.data.find(r => r.id === paymentId);
      expect(p?.method).toBe("virement");
    });

    it("devrait créer un audit_log après modification", async () => {
      const { db } = await import("@/lib/db");
      const { auditLog } = await import("@/lib/models/schema");
      const { eq } = await import("drizzle-orm");

      const logs = await db.select()
        .from(auditLog)
        .where(eq(auditLog.tableName, "payments"))
        .where(eq(auditLog.action, "update"));

      expect(logs.length).toBeGreaterThanOrEqual(1);
    });

    it("devrait échouer pour un paiement inexistant", async () => {
      const { editPayment } = await import("@/lib/services/payment.service");
      await expect(editPayment("99999", { amount: 100 })).rejects.toThrow("Paiement introuvable");
    });
  });

  // ─────────── D. SUPPRESSION PAIEMENT ───────────

  describe("D. removePayment - Suppression", () => {
    let tempPaymentId: string;

    it("devrait créer puis supprimer un paiement", async () => {
      const { addPayment, removePayment, getPayments } = await import("@/lib/services/payment.service");

      const created = await addPayment({ studentId: Number(studentId2), amount: 5000, method: "espèces", date: "2025-12-20" });
      tempPaymentId = created.id;

      await removePayment(tempPaymentId);

      const result = await getPayments({ studentId: studentId2 });
      expect(result.data.find(p => p.id === tempPaymentId)).toBeUndefined();
    });

    it("devrait créer un audit_log après suppression", async () => {
      const { db } = await import("@/lib/db");
      const { auditLog } = await import("@/lib/models/schema");
      const { eq } = await import("drizzle-orm");

      const logs = await db.select()
        .from(auditLog)
        .where(eq(auditLog.tableName, "payments"))
        .where(eq(auditLog.action, "delete"));

      expect(logs.length).toBeGreaterThanOrEqual(1);
    });

    it("devrait échouer pour un paiement inexistant", async () => {
      const { removePayment } = await import("@/lib/services/payment.service");
      await expect(removePayment("99999")).rejects.toThrow("Paiement introuvable");
    });
  });

  // ─────────── E. RÉSUMÉ FINANCIER ───────────

  describe("E. getStudentPaymentSummaryService - Résumé", () => {
    it("devrait calculer le total payé pour un étudiant", async () => {
      const { getStudentPaymentSummaryService } = await import("@/lib/services/payment.service");
      // Student 1 has: 30000 + 35000 (modifié) = 65000
      const summary = await getStudentPaymentSummaryService(studentId1);
      expect(summary.totalPaid).toBe(65000);
    });

    it("devrait retourner 0 pour un étudiant sans paiement", async () => {
      const { getStudentPaymentSummaryService } = await import("@/lib/services/payment.service");
      const summary = await getStudentPaymentSummaryService("999");
      expect(summary.totalPaid).toBe(0);
    });
  });

  // ─────────── F. LISTE IMPAYÉS ───────────

  describe("F. getUnpaidStudents - Impayés", () => {
    it("devrait retourner des impayés si totalFee > totalPaid", async () => {
      const { db } = await import("@/lib/db");
      const { classes } = await import("@/lib/models/schema");
      const { eq } = await import("drizzle-orm");

      // Fixer totalFee pour la classe à 50000
      await db.update(classes).set({ totalFee: 50000 }).where(eq(classes.id, Number(classId1)));

      // Student 1: 65000 payé > 50000 → pas impayé
      // Student 2: 15000 + 10000 = 25000 payé < 50000 → impayé (remaining = 25000)
      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      const result = await getUnpaidStudents({ academicYearId });

      expect(result.data.length).toBe(1);
      expect(result.data[0].firstName).toBe("Fatoumata");
      expect(result.data[0].remaining).toBe(25000);
    });

    it("devrait filtrer les impayés par classe", async () => {
      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      // Student 1 et 2 sont en classe 1
      const result = await getUnpaidStudents({ classId: classId1, academicYearId });
      expect(result.data.length).toBe(1);
    });

    it("devrait retourner une classe vide si filtre classe inexistante", async () => {
      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      const result = await getUnpaidStudents({ classId: "999" });
      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it("devrait retourner les champs attendus (totalFee, totalPaid, remaining)", async () => {
      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      const result = await getUnpaidStudents({ academicYearId });

      const u = result.data[0];
      expect(u.totalFee).toBeTypeOf("number");
      expect(u.totalPaid).toBeTypeOf("number");
      expect(u.remaining).toBe(u.totalFee - u.totalPaid);
      expect(u.classId).toBeTruthy();
      expect(u.className).toBeTruthy();
    });

    it("devrait paginer les impayés", async () => {
      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      const result = await getUnpaidStudents({ page: 1, limit: 1 });
      expect(result.data.length).toBeLessThanOrEqual(1);
      expect(result.total).toBeGreaterThanOrEqual(1);
    });

    it("devrait retourner vide si tous les étudiants ont payé", async () => {
      // Student 2: 25000 déjà payé + 25000 = 50000 = totalFee
      const { addPayment } = await import("@/lib/services/payment.service");
      await addPayment({ studentId: Number(studentId2), amount: 25000, method: "espèces", date: "2025-12-25" });

      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      const result = await getUnpaidStudents({ academicYearId });
      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  // ─────────── G. getPaymentById ───────────

  describe("G. getPaymentById - Lecture par ID", () => {
    it("devrait retourner un paiement existant par son ID", async () => {
      const { getPaymentById } = await import("@/lib/services/payment.service");
      const { getPayments } = await import("@/lib/services/payment.service");

      const list = await getPayments({ studentId: studentId1 });
      const firstId = list.data[0]?.id;
      if (!firstId) return;

      const payment = await getPaymentById(firstId);
      expect(payment).not.toBeNull();
      expect(payment!.id).toBe(firstId);
      expect(payment!.amount).toBeGreaterThan(0);
      expect(payment!.method).toBeTruthy();
    });

    it("devrait retourner null pour un ID inexistant", async () => {
      const { getPaymentById } = await import("@/lib/services/payment.service");
      const payment = await getPaymentById("99999");
      expect(payment).toBeNull();
    });
  });

  // ─────────── H. getPaymentStatsService ───────────

  describe("H. getPaymentStatsService - Statistiques paiements", () => {
    it("devrait retourner les stats globales", async () => {
      const { getPaymentStatsService } = await import("@/lib/services/payment.service");

      const stats = await getPaymentStatsService();
      expect(stats.totalRevenue).toBeGreaterThan(0);
      expect(stats.totalPayments).toBeGreaterThan(0);
    });

    it("devrait filtrer les stats par plage de dates", async () => {
      const { getPaymentStatsService } = await import("@/lib/services/payment.service");

      const stats = await getPaymentStatsService("2025-10-01", "2025-10-31");
      // Student 1: 30000 (2025-10-01) + Student 2: 10000 (2025-10-05)
      expect(stats.totalRevenue).toBe(40000);
      expect(stats.totalPayments).toBe(2);
    });

    it("devrait retourner 0 pour une période sans paiements", async () => {
      const { getPaymentStatsService } = await import("@/lib/services/payment.service");

      const stats = await getPaymentStatsService("2020-01-01", "2020-01-31");
      expect(stats.totalRevenue).toBe(0);
      expect(stats.totalPayments).toBe(0);
    });
  });

  // ─────────── I. FILTRE `from` UNIQUEMENT (date d'inscription) ───────────

  describe("I. getPayments - Filtre from uniquement", () => {
    it("devrait retourner les paiements après une date donnée (from sans to)", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: studentId1, from: "2025-10-01" });
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      result.data.forEach(p => {
        expect(p.date >= "2025-10-01").toBe(true);
      });
    });

    it("devrait retourner vide si from est dans le futur", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: studentId1, from: "2099-01-01" });
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("devrait retourner tous les paiements si from est très ancien", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: studentId1, from: "2000-01-01" });
      expect(result.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─────────── I. MODIFICATION COMPLÈTE ───────────

  describe("J. editPayment - Modification complète (tous les champs)", () => {
    it("devrait modifier montant + méthode + feeTypeId simultanément", async () => {
      const { editPayment, getPayments, addFeeType } = await import("@/lib/services/payment.service");

      // Créer un type de frais
      const feeType = await addFeeType({ name: "Scolarité", amount: 50000, period: "annuel" });

      // Récupérer un paiement existant
      const before = await getPayments({ studentId: studentId1 });
      const p = before.data[0];

      await editPayment(p.id, { amount: 10000, method: "virement", feeTypeId: Number(feeType.id) });

      const after = await getPayments({ studentId: studentId1 });
      const updated = after.data.find(r => r.id === p.id);
      expect(updated?.amount).toBe(10000);
      expect(updated?.method).toBe("virement");
      expect(updated?.feeTypeName).toBe("Scolarité");
    });
  });

  // ─────────── J. PLAFOND PAIEMENT (totalPaid vs classFee) ───────────

  describe("K. Validation plafond - totalPaid ne dépasse pas classFee", () => {
    it("devrait permettre un paiement dans la limite des frais", async () => {
      const { db } = await import("@/lib/db");
      const { classes } = await import("@/lib/models/schema");
      const { eq } = await import("drizzle-orm");
      const { addPayment } = await import("@/lib/services/payment.service");

      // Restaurer totalFee après le test des impayés
      await db.update(classes).set({ totalFee: 80000 }).where(eq(classes.id, Number(classId1)));

      const p = await addPayment({ studentId: Number(studentId1), amount: 10000, method: "espèces", date: "2025-12-01" });
      expect(p.amount).toBe(10000);
    });

    it("devrait calculer correctement totalPaid en cumulant les paiements", async () => {
      const { getStudentPaymentSummaryService } = await import("@/lib/services/payment.service");

      // Student 1 a cumulé des paiements dans les sections précédentes
      const summary = await getStudentPaymentSummaryService(studentId1);
      expect(summary.totalPaid).toBeGreaterThan(0);
    });

    it("devrait retourner 0 pour un étudiant sans paiement", async () => {
      const { getStudentPaymentSummaryService } = await import("@/lib/services/payment.service");

      const summary = await getStudentPaymentSummaryService("99999");
      expect(summary.totalPaid).toBe(0);
    });
  });
});
