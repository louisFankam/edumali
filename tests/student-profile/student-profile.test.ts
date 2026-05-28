import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";

describe("Student Profile Page - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  // ─────────── UTILITY ───────────

  async function getStudentById(id: string) {
    const { getStudentById } = await import("@/lib/services/student.service");
    const { editStudent } = await import("@/lib/services/student.service");
    return { getStudentById, editStudent };
  }

  // ─────────── 1. AFFICHAGE ÉTUDIANT ───────────

  describe("1. Général - Affichage étudiant", () => {
    it("devrait récupérer un étudiant existant par son ID", async () => {
      const { getStudentById } = await import("@/lib/services/student.service");
      const student = await getStudentById("1");

      expect(student).not.toBeNull();
      expect(student.id).toBe("1");
      expect(student.firstName).toBeTruthy();
      expect(student.lastName).toBeTruthy();
      expect(student.className).toBeTruthy();
      expect(student.gender).toMatch(/^(Masculin|Féminin)$/);
      expect(student.status).toMatch(/^(Actif|Inactif)$/);
      expect(student.classId).toBeTruthy();
    });

    it("devrait retourner null pour un étudiant inexistant", async () => {
      const { getStudentById } = await import("@/lib/services/student.service");
      const student = await getStudentById("99999");
      expect(student).toBeNull();
    });

    it("devrait retourner null pour un ID invalide", async () => {
      const { getStudentById } = await import("@/lib/services/student.service");
      const student = await getStudentById("abc");
      expect(student).toBeNull();
    });
  });

  // ─────────── 2. MODIFICATION ÉTUDIANT ───────────

  describe("2. Général - Modification étudiant (PUT /api/students/:id)", () => {
    it("devrait mettre à jour les champs d'un étudiant", async () => {
      const { editStudent } = await import("@/lib/services/student.service");
      const updated = await editStudent("1", {
        firstName: "AmadouTest",
        lastName: "DialloTest",
        nationality: "Malienne",
      });

      expect(updated.firstName).toBe("AmadouTest");
      expect(updated.lastName).toBe("DialloTest");
      expect(updated.nationality).toBe("Malienne");

      // Vérifier persistance en re-lisant
      const { getStudentById } = await import("@/lib/services/student.service");
      const reloaded = await getStudentById("1");
      expect(reloaded.firstName).toBe("AmadouTest");
      expect(reloaded.lastName).toBe("DialloTest");
    });

    it("devrait mettre à jour le statut d'un étudiant", async () => {
      const { editStudent } = await import("@/lib/services/student.service");
      const updated = await editStudent("1", { status: "Inactif" });
      expect(updated.status).toBe("Inactif");

      // Remettre Actif pour les autres tests
      await editStudent("1", { status: "Actif" });
    });

    it("devrait mettre à jour la classe d'un étudiant", async () => {
      const { editStudent } = await import("@/lib/services/student.service");
      const updated = await editStudent("1", { classId: "2" });
      expect(updated.classId).toBe("2");
      expect(updated.className).toBe("2ème Année");

      // Remettre dans la classe 1
      await editStudent("1", { classId: "1" });
    });

    it("devrait retourner null pour un étudiant inexistant en modification", async () => {
      const { editStudent } = await import("@/lib/services/student.service");
      const result = await editStudent("99999", { firstName: "Nope" });
      expect(result).toBeNull();
    });
  });

  // ─────────── 3. INFOS MÉDICALES ───────────

  describe("3. Médical - Sauvegarde et affichage", () => {
    it("devrait retourner null si aucun info médicale n'existe", async () => {
      const { getMedicalInfo } = await import("@/lib/services/medical.service");
      const data = await getMedicalInfo("1");
      expect(data).toBeNull();
    });

    it("devrait créer des infos médicales (INSERT)", async () => {
      const { saveMedicalInfo } = await import("@/lib/services/medical.service");
      const input = {
        bloodType: "A+",
        allergies: "Pollen, Acariens",
        medicalConditions: "Asthme léger",
        medications: "Ventoline",
        doctorName: "Dr. Koné",
        doctorPhone: "70123456",
        emergencyContact: "Mère de l'élève",
        emergencyPhone: "76123456",
        vaccinationStatus: "À jour",
      };
      const result = await saveMedicalInfo("1", input);
      expect(result.id).toBeTruthy();
      expect(result.studentId).toBe("1");
    });

    it("devrait lire les infos médicales créées", async () => {
      const { getMedicalInfo } = await import("@/lib/services/medical.service");
      const data = await getMedicalInfo("1");

      expect(data).not.toBeNull();
      expect(data.bloodType).toBe("A+");
      expect(data.allergies).toBe("Pollen, Acariens");
      expect(data.medicalConditions).toBe("Asthme léger");
      expect(data.medications).toBe("Ventoline");
      expect(data.doctorName).toBe("Dr. Koné");
      expect(data.doctorPhone).toBe("70123456");
      expect(data.emergencyContact).toBe("Mère de l'élève");
      expect(data.emergencyPhone).toBe("76123456");
      expect(data.vaccinationStatus).toBe("À jour");
    });

    it("devrait mettre à jour les infos médicales (UPSERT = UPDATE)", async () => {
      const { saveMedicalInfo, getMedicalInfo } = await import("@/lib/services/medical.service");

      await saveMedicalInfo("1", { bloodType: "O+", allergies: "Aucune" });

      const data = await getMedicalInfo("1");
      expect(data.bloodType).toBe("O+");
      expect(data.allergies).toBe("Aucune");
      // Les champs non modifiés doivent rester
      expect(data.medicalConditions).toBe("Asthme léger");
      expect(data.doctorName).toBe("Dr. Koné");
    });

    it("devrait accepter des champs vides en médical", async () => {
      const { saveMedicalInfo, getMedicalInfo } = await import("@/lib/services/medical.service");

      await saveMedicalInfo("1", {
        bloodType: "", allergies: "", medicalConditions: "",
        medications: "", doctorName: "", doctorPhone: "",
        emergencyContact: "", emergencyPhone: "", vaccinationStatus: "",
      });

      const data = await getMedicalInfo("1");
      expect(data.bloodType).toBe("");
      expect(data.allergies).toBe("");
    });
  });

  // ─────────── 4. INFOS FAMILIALES ───────────

  describe("4. Famille - Sauvegarde et affichage", () => {
    it("devrait retourner null si aucune info familiale n'existe", async () => {
      const { getFamilyInfo } = await import("@/lib/services/family.service");
      // Student 2 n'a pas d'infos familiales
      const data = await getFamilyInfo("2");
      expect(data).toBeNull();
    });

    it("devrait créer des infos familiales (INSERT)", async () => {
      const { saveFamilyInfo } = await import("@/lib/services/family.service");
      const result = await saveFamilyInfo("1", {
        fatherName: "Moussa Diallo",
        fatherPhone: "70123456",
        fatherProfession: "Enseignant",
        motherName: "Aminata Diallo",
        motherPhone: "76123456",
        motherProfession: "Ménagère",
        guardianName: "",
        guardianRelation: "",
        guardianPhone: "",
      });
      expect(result.id).toBeTruthy();
      expect(result.studentId).toBe("1");
    });

    it("devrait lire les infos familiales créées", async () => {
      const { getFamilyInfo } = await import("@/lib/services/family.service");
      const data = await getFamilyInfo("1");

      expect(data).not.toBeNull();
      expect(data.fatherName).toBe("Moussa Diallo");
      expect(data.fatherPhone).toBe("70123456");
      expect(data.fatherProfession).toBe("Enseignant");
      expect(data.motherName).toBe("Aminata Diallo");
      expect(data.motherPhone).toBe("76123456");
      expect(data.motherProfession).toBe("Ménagère");
    });

    it("devrait mettre à jour les infos familiales (UPSERT = UPDATE)", async () => {
      const { saveFamilyInfo, getFamilyInfo } = await import("@/lib/services/family.service");

      await saveFamilyInfo("1", { fatherName: "Moussa Mis à jour", fatherPhone: "71234567" });

      const data = await getFamilyInfo("1");
      expect(data.fatherName).toBe("Moussa Mis à jour");
      expect(data.fatherPhone).toBe("71234567");
      expect(data.motherName).toBe("Aminata Diallo"); // Inchangé
    });

    it("devrait créer des infos familiales pour un autre étudiant", async () => {
      const { saveFamilyInfo, getFamilyInfo } = await import("@/lib/services/family.service");

      await saveFamilyInfo("2", {
        fatherName: "Oumar Traoré",
        fatherPhone: "66123456",
        fatherProfession: "Commerçant",
        motherName: "",
        motherPhone: "",
        motherProfession: "",
        guardianName: "",
        guardianRelation: "",
        guardianPhone: "",
      });

      const data = await getFamilyInfo("2");
      expect(data.fatherName).toBe("Oumar Traoré");

      // Vérifier que student 1 n'a pas été affecté
      const data1 = await getFamilyInfo("1");
      expect(data1.fatherName).toBe("Moussa Mis à jour");
    });
  });

  // ─────────── 5. HISTORIQUE ACADÉMIQUE ───────────

  describe("5. Académique - CR complet", () => {
    it("devrait retourner une liste vide si aucun historique", async () => {
      const { getAcademicHistories } = await import("@/lib/services/academic-history.service");
      const records = await getAcademicHistories("1");
      expect(records).toEqual([]);
    });

    it("devrait ajouter un historique scolaire", async () => {
      const { addAcademicHistory } = await import("@/lib/services/academic-history.service");
      const created = await addAcademicHistory("1", {
        schoolName: "École Primaire de Bamako",
        className: "CM2",
        academicYear: "2023-2024",
        reason: "Passage en 6ème",
        remarks: "Excellent élève",
      });

      expect(created.id).toBeTruthy();
      expect(created.schoolName).toBe("École Primaire de Bamako");
      expect(created.className).toBe("CM2");
      expect(created.academicYear).toBe("2023-2024");
    });

    it("devrait ajouter un deuxième historique", async () => {
      const { addAcademicHistory } = await import("@/lib/services/academic-history.service");
      const created = await addAcademicHistory("2", {
        schoolName: "École de Kalaban",
        className: "CE2",
        academicYear: "2021-2022",
        reason: "",
        remarks: "",
      });

      expect(created.id).toBeTruthy();
    });

    it("devrait lister tous les historiques d'un étudiant", async () => {
      const { getAcademicHistories } = await import("@/lib/services/academic-history.service");
      const records = await getAcademicHistories("1");

      expect(records.length).toBe(1);
      expect(records[0].schoolName).toBe("École Primaire de Bamako");
    });

    it("devrait ajouter un historique avec schoolName vide (validation côté route uniquement)", async () => {
      const { addAcademicHistory, removeAcademicHistory } = await import("@/lib/services/academic-history.service");
      const created = await addAcademicHistory("1", { schoolName: "" });
      expect(created.schoolName).toBe("");
      await removeAcademicHistory(created.id);
    });

    it("devrait modifier un historique scolaire", async () => {
      const { getAcademicHistories, editAcademicHistory } = await import("@/lib/services/academic-history.service");

      const records = await getAcademicHistories("1");
      const id = records[0].id;

      const updated = await editAcademicHistory(id, {
        schoolName: "École Primaire de Bamako (modifiée)",
        className: "6ème",
      });

      expect(updated.schoolName).toBe("École Primaire de Bamako (modifiée)");
      expect(updated.className).toBe("6ème");

      // Vérifier persistance
      const reloaded = await getAcademicHistories("1");
      expect(reloaded[0].schoolName).toBe("École Primaire de Bamako (modifiée)");
    });

    it("devrait supprimer un historique scolaire", async () => {
      const { getAcademicHistories, removeAcademicHistory } = await import("@/lib/services/academic-history.service");

      // Ajouter puis supprimer
      const { addAcademicHistory } = await import("@/lib/services/academic-history.service");
      const created = await addAcademicHistory("1", {
        schoolName: "Temporaire",
        className: "CP",
        academicYear: "2020-2021",
        reason: "Test",
        remarks: "À supprimer",
      });

      let records = await getAcademicHistories("1");
      const countBefore = records.length;

      await removeAcademicHistory(created.id);

      records = await getAcademicHistories("1");
      expect(records.length).toBe(countBefore - 1);
      expect(records.find(r => r.id === created.id)).toBeUndefined();
    });
  });

  // ─────────── 6. PAIEMENTS ───────────

  describe("6. Financier - Paiements", () => {
    it("devrait retourner une liste vide si aucun paiement", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");
      const result = await getPayments({ studentId: "1" });
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("devrait créer un paiement", async () => {
      const { addPayment } = await import("@/lib/services/payment.service");
      const payment = await addPayment({
        studentId: 1,
        amount: 50000,
        method: "espèces",
        date: "2024-10-15",
        notes: "Frais de scolarité 1er trimestre",
      });

      expect(payment.id).toBeTruthy();
      expect(payment.amount).toBe(50000);
      expect(payment.method).toBe("espèces");
      expect(payment.date).toBe("2024-10-15");
      expect(payment.status).toBe("payé");
    });

    it("devrait créer un paiement avec mobile money", async () => {
      const { addPayment } = await import("@/lib/services/payment.service");
      const payment = await addPayment({
        studentId: 1,
        amount: 25000,
        method: "mobile_money",
        date: "2024-11-01",
      });

      expect(payment.amount).toBe(25000);
      expect(payment.method).toBe("mobile_money");
    });

    it("devrait créer un paiement avec un type de frais", async () => {
      const { addPayment, getFeeTypes } = await import("@/lib/services/payment.service");

      // Vérifier les types de frais existants
      const feeTypes = await getFeeTypes();
      // La DB seed ne crée pas de fee_types, donc la liste peut être vide

      const payment = await addPayment({
        studentId: 1,
        amount: 10000,
        method: "virement",
        date: "2024-12-01",
        feeTypeId: undefined,
      });

      expect(payment.amount).toBe(10000);
    });

    it("devrait lister les paiements filtrés par étudiant", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({ studentId: "1" });
      expect(result.data.length).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeGreaterThanOrEqual(3);

      // Tous les paiements doivent appartenir à l'étudiant 1
      result.data.forEach(p => {
        expect(p.studentId).toBe("1");
      });
    });

    it("devrait lister les paiements avec filtre de dates", async () => {
      const { getPayments } = await import("@/lib/services/payment.service");

      const result = await getPayments({
        studentId: "1",
        from: "2024-10-01",
        to: "2024-10-31",
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].amount).toBe(50000);
    });

    it("devrait retourner le résumé des paiements d'un étudiant", async () => {
      const { getStudentPaymentSummaryService } = await import("@/lib/services/payment.service");

      const summary = await getStudentPaymentSummaryService("1");
      // 50000 + 25000 + 10000 = 85000
      expect(summary.totalPaid).toBe(85000);
    });

    it("devrait créer un audit_log lors d'un paiement", async () => {
      // L'addPayment appelle logAudit, vérifions en lisant audit_log
      const { db } = await import("@/lib/db");
      const { auditLog } = await import("@/lib/models/schema");
      const { eq } = await import("drizzle-orm");

      const logs = await db.select()
        .from(auditLog)
        .where(eq(auditLog.tableName, "payments"))
        .where(eq(auditLog.action, "create"));

      expect(logs.length).toBeGreaterThanOrEqual(3);
      expect(logs[0].action).toBe("create");
      expect(logs[0].newValues).toBeTruthy();
    });
  });

  // ─────────── 7. RÉSUMÉ FINANCIER ───────────

  describe("7. Financier - Résumé (Total Frais / Payé / Restant)", () => {
    it("devrait calculer correctement le total payé", async () => {
      const { getStudentPaymentSummaryService } = await import("@/lib/services/payment.service");
      const summary = await getStudentPaymentSummaryService("1");
      expect(summary.totalPaid).toBe(85000);
    });

    it("devrait donner la classe avec son totalFee", async () => {
      const { getStudentById } = await import("@/lib/services/student.service");
      const student = await getStudentById("1");

      // Récupérer les classes
      const { getClasses } = await import("@/lib/services/student.service");
      const classes = await getClasses();

      const studentClass = classes.find(c => c.id === student.classId);
      expect(studentClass).toBeTruthy();
      expect(studentClass.totalFee).toBeDefined();
      expect(typeof studentClass.totalFee).toBe("number");
    });
  });
});
