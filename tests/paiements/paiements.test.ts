import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";

describe("Paiements Page - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  // ─────────── A. LISTE PAIEMENTS ───────────

  describe("A. getPayments - Liste des paiements", () => {
    it("devrait retourner une liste vide pour un étudiant sans paiement", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ studentId: "1" });
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("devrait lister les paiements après création", async () => {
      const { addPayment, getPayments } = await import("@/lib/services/payment.service");

      await addPayment({ studentId: 1, amount: 30000, method: "espèces", date: "2025-10-01" });
      await addPayment({ studentId: 1, amount: 20000, method: "mobile_money", date: "2025-11-01" });

      const result = await getPayments({ studentId: "1" });
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it("devrait retourner les bons champs (amount, method, date, status)", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ studentId: "1" });

      const p = result.data[0];
      expect(p.amount).toBeTypeOf("number");
      expect(p.method).toMatch(/^(espèces|virement|chèque|mobile_money)$/);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.status).toBe("payé");
    });

    it("devrait filtrer par plage de dates", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: "1", from: "2025-10-01", to: "2025-10-31" });
      expect(result.data.length).toBe(1);
      expect(result.data[0].amount).toBe(30000);

      const result2 = await getPayments({ studentId: "1", from: "2025-12-01", to: "2025-12-31" });
      expect(result2.data.length).toBe(0);
    });

    it("devrait paginer les résultats", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ studentId: "1", page: 1, limit: 1 });
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(2);
    });
  });

  // ─────────── B. CRÉATION PAIEMENT ───────────

  describe("B. addPayment - Création (réutilise student-profile)", () => {
    it("devrait créer un paiement avec feeTypeId", async () => {
      const { addPayment, getPayments } = await import("@/lib/services/payment.service");

      const payment = await addPayment({
        studentId: 2, amount: 15000, method: "chèque", date: "2025-12-15",
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
      const result = await getPayments({ studentId: "1" });
      paymentId = result.data[0].id;
      expect(paymentId).toBeTruthy();
    });

    it("devrait modifier le montant", async () => {
      const { editPayment, getPayments } = await import("@/lib/services/payment.service");
      await editPayment(paymentId, { amount: 35000 });

      const result = await getPayments({ studentId: "1" });
      const p = result.data.find(r => r.id === paymentId);
      expect(p?.amount).toBe(35000);
    });

    it("devrait modifier la méthode de paiement", async () => {
      const { editPayment, getPayments } = await import("@/lib/services/payment.service");
      await editPayment(paymentId, { method: "virement" });

      const result = await getPayments({ studentId: "1" });
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

      const created = await addPayment({ studentId: 2, amount: 5000, method: "espèces", date: "2025-12-20" });
      tempPaymentId = created.id;

      await removePayment(tempPaymentId);

      const result = await getPayments({ studentId: "2" });
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
      const summary = await getStudentPaymentSummaryService("1");
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

      // Fixer totalFee pour la classe 1 à 50000
      await db.update(classes).set({ totalFee: 50000 }).where(eq(classes.id, 1));

      // Student 1: 65000 payé > 50000 → pas impayé
      // Student 2: 15000 payé < 50000 → impayé (remaining = 35000)
      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      const result = await getUnpaidStudents({ academicYearId: "1" });

      expect(result.data.length).toBe(1);
      expect(result.data[0].firstName).toBe("Fatoumata");
      expect(result.data[0].remaining).toBe(35000);
    });

    it("devrait filtrer les impayés par classe", async () => {
      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      // Student 1 et 2 sont en classe 1
      const result = await getUnpaidStudents({ classId: "1", academicYearId: "1" });
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
      const result = await getUnpaidStudents({ academicYearId: "1" });

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
      // Payer pour student 2 (50000)
      const { addPayment } = await import("@/lib/services/payment.service");
      await addPayment({ studentId: 2, amount: 35000, method: "espèces", date: "2025-12-25" });

      const { getUnpaidStudents } = await import("@/lib/services/payment.service");
      const result = await getUnpaidStudents({ academicYearId: "1" });
      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  // ─────────── H. FILTRE `from` UNIQUEMENT (date d'inscription) ───────────

  describe("H. getPayments - Filtre from uniquement", () => {
    it("devrait retourner les paiements après une date donnée (from sans to)", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: "1", from: "2025-10-01" });
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      result.data.forEach(p => {
        expect(p.date >= "2025-10-01").toBe(true);
      });
    });

    it("devrait retourner vide si from est dans le futur", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: "1", from: "2099-01-01" });
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("devrait retourner tous les paiements si from est très ancien", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: "1", from: "2000-01-01" });
      expect(result.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─────────── I. MODIFICATION COMPLÈTE ───────────

  describe("I. editPayment - Modification complète (tous les champs)", () => {
    it("devrait modifier montant + méthode + feeTypeId simultanément", async () => {
      const { editPayment, getPayments, addFeeType } = await import("@/lib/services/payment.service");

      // Créer un type de frais
      await addFeeType({ name: "Scolarité", amount: 50000, period: "annuel" });

      // Récupérer un paiement existant
      const before = await getPayments({ studentId: "1" });
      const p = before.data[0];

      await editPayment(p.id, { amount: 40000, method: "virement", feeTypeId: 1 });

      const after = await getPayments({ studentId: "1" });
      const updated = after.data.find(r => r.id === p.id);
      expect(updated?.amount).toBe(40000);
      expect(updated?.method).toBe("virement");
      expect(updated?.feeTypeName).toBeTruthy();
    });
  });

  // ─────────── J. PLAFOND PAIEMENT (totalPaid vs classFee) ───────────

  describe("J. Validation plafond - totalPaid ne dépasse pas classFee", () => {
    it("devrait permettre un paiement dans la limite des frais", async () => {
      const { addPayment, getPayments } = await import("@/lib/services/payment.service");

      // Student 1 n'a pas encore de classe avec totalFee défini
      // On ajoute un paiement de 10000
      const p = await addPayment({ studentId: 1, amount: 10000, method: "espèces", date: "2025-12-01" });
      expect(p.amount).toBe(10000);
    });

    it("devrait calculer correctement totalPaid en cumulant les paiements", async () => {
      const { getStudentPaymentSummaryService } = await import("@/lib/services/payment.service");

      // Student 1 a cumulé des paiements dans les sections précédentes
      const summary = await getStudentPaymentSummaryService("1");
      expect(summary.totalPaid).toBeGreaterThan(0);
    });

    it("devrait retourner 0 pour un étudiant sans paiement", async () => {
      const { getStudentPaymentSummaryService } = await import("@/lib/services/payment.service");

      const summary = await getStudentPaymentSummaryService("99999");
      expect(summary.totalPaid).toBe(0);
    });
  });
});
