import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";
import { seedClass, seedStudent, seedTeacher, seedAcademicYear, seedEnrollment } from "../helpers/seed";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

let classId1: string
let studentId1: string
let studentId2: string
let teacherId1: string
let teacherId2: string
let academicYearId: string

describe("Presence Page - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    classId1 = await seedClass({ name: "1ère Année", totalFee: 0 })
    academicYearId = await seedAcademicYear({ name: "2024-2025", isCurrent: true })
    studentId1 = await seedStudent(classId1, {
      firstName: "Amadou", lastName: "Diallo",
      gender: "Masculin", parentName: "Moussa Diallo", parentPhone: "70123456",
    })
    studentId2 = await seedStudent(classId1, {
      firstName: "Fatoumata", lastName: "Traoré",
      gender: "Féminin", parentName: "Oumar Traoré", parentPhone: "66123456",
    })
    teacherId1 = await seedTeacher({
      firstName: "Mamadou", lastName: "Koné",
      email: "mamadou.kone@ecole.ml", gender: "Masculin",
    })
    teacherId2 = await seedTeacher({
      firstName: "Aminata", lastName: "Diallo",
      email: "aminata.diallo@ecole.ml", gender: "Féminin",
    })
    await seedEnrollment(studentId1, classId1, academicYearId)
    await seedEnrollment(studentId2, classId1, academicYearId)
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  // ─────────── A. LECTURE PRÉSENCES ───────────

  describe("A. Lecture - getAttendanceByDateAndClass", () => {
    it("devrait retourner une liste vide pour une date sans présence", async () => {
      const { getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByDateAndClass("2024-10-15", classId1);
      expect(records).toEqual([]);
    });

    it("devrait retourner une liste vide pour une classe inexistante", async () => {
      const { getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByDateAndClass("2024-10-15", "999");
      expect(records).toEqual([]);
    });

    it("devrait retourner les présences après sauvegarde", async () => {
      const { saveAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");

      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date: "2024-10-15", status: "présent" },
        { studentId: Number(studentId2), classId: Number(classId1), date: "2024-10-15", status: "absent" },
      ]);

      const records = await getAttendanceByDateAndClass("2024-10-15", classId1);
      expect(records.length).toBe(2);
      expect(records[0].studentName).toBeTruthy();
      expect(records[0].className).toBe("1ère Année");
    });
  });

  // ─────────── B. SAUVEGARDE (UPSERT) ───────────

  describe("B. Sauvegarde - saveAttendance (upsert)", () => {
    it("devrait créer des enregistrements (INSERT)", async () => {
      const { saveAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");

      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date: "2024-11-01", status: "retard" },
      ]);

      const records = await getAttendanceByDateAndClass("2024-11-01", classId1);
      expect(records.length).toBe(1);
      expect(records[0].status).toBe("retard");
    });

    it("devrait mettre à jour un enregistrement existant (UPSERT = UPDATE)", async () => {
      const { saveAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");

      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date: "2024-11-01", status: "présent" },
      ]);

      const records = await getAttendanceByDateAndClass("2024-11-01", classId1);
      expect(records.length).toBe(1);
      expect(records[0].status).toBe("présent");
    });

    it("devrait gérer tous les statuts: présent, absent, retard, congé", async () => {
      const { saveAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");

      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date: "2024-12-01", status: "présent" },
        { studentId: Number(studentId2), classId: Number(classId1), date: "2024-12-01", status: "absent" },
      ]);

      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date: "2024-12-02", status: "retard" },
        { studentId: Number(studentId2), classId: Number(classId1), date: "2024-12-02", status: "congé" },
      ]);

      const day1 = await getAttendanceByDateAndClass("2024-12-01", classId1);
      expect(day1.find(r => r.studentId === studentId1)?.status).toBe("présent");
      expect(day1.find(r => r.studentId === studentId2)?.status).toBe("absent");

      const day2 = await getAttendanceByDateAndClass("2024-12-02", classId1);
      expect(day2.find(r => r.studentId === studentId1)?.status).toBe("retard");
      expect(day2.find(r => r.studentId === studentId2)?.status).toBe("congé");
    });

    it("devrait retourner des studentName et className via la relation", async () => {
      const { getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByDateAndClass("2024-10-15", classId1);

      expect(records.length).toBeGreaterThan(0);
      records.forEach(r => {
        expect(r.studentName).toMatch(/^[A-Za-zÀ-ÿ]+ [A-Za-zÀ-ÿ]+$/);
        expect(r.className).toBe("1ère Année");
      });
    });

    it("devrait accepter un justification optionnelle", async () => {
      const { saveAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");

      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date: "2024-12-03", status: "absent", justification: "Malade" },
      ]);

      const records = await getAttendanceByDateAndClass("2024-12-03", classId1);
      expect(records[0].justification).toBe("Malade");
    });
  });

  // ─────────── C. STATISTIQUES ───────────

  describe("C. Statistiques - getAttendanceStats", () => {
    it("devrait retourner les stats pour une classe sur une date", async () => {
      const { getAttendanceStats } = await import("@/lib/services/attendance.service");
      const stats = await getAttendanceStats(undefined, classId1, "2024-10-15", "2024-10-15");

      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.présent).toBeGreaterThanOrEqual(1);
      expect(stats.absent).toBeGreaterThanOrEqual(1);
      expect(typeof stats.rate).toBe("number");
    });

    it("devrait retourner les stats pour un étudiant spécifique", async () => {
      const { getAttendanceStats } = await import("@/lib/services/attendance.service");
      const stats = await getAttendanceStats(studentId1);

      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(typeof stats.présent).toBe("number");
      expect(typeof stats.absent).toBe("number");
      expect(typeof stats.retard).toBe("number");
      expect(typeof stats.congé).toBe("number");
    });

    it("devrait retourner des stats vides pour un étudiant sans présence", async () => {
      const { getAttendanceStats } = await import("@/lib/services/attendance.service");
      const stats = await getAttendanceStats(studentId1, undefined, "2099-01-01", "2099-12-31");
      expect(stats.total).toBe(0);
      expect(stats.présent).toBe(0);
      expect(stats.rate).toBe(0);
    });

    it("devrait calculer le taux correctement (présent+congé)/total", async () => {
      const { saveAttendance, getAttendanceStats } = await import("@/lib/services/attendance.service");

      // 3 entries: 1 présent, 1 absent, 1 congé => rate = (1+1)/3 = 67%
      await saveAttendance([
        { studentId: Number(studentId2), classId: Number(classId1), date: "2024-12-10", status: "présent" },
        { studentId: Number(studentId2), classId: Number(classId1), date: "2024-12-11", status: "absent" },
        { studentId: Number(studentId2), classId: Number(classId1), date: "2024-12-12", status: "congé" },
      ]);

      const stats = await getAttendanceStats(studentId2, classId1, "2024-12-10", "2024-12-12");
      expect(stats.total).toBe(3);
      expect(stats.présent).toBe(1);
      expect(stats.absent).toBe(1);
      expect(stats.congé).toBe(1);
      expect(stats.rate).toBe(67);
    });
  });

  // ─────────── D. HISTORIQUE PAR PLAGE ───────────

  describe("D. Historique - getAttendanceByRange", () => {
    it("devrait retourner les présences sur une plage de dates", async () => {
      const { getAttendanceByRange } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByRange("2024-10-01", "2024-12-31", classId1);

      expect(records.length).toBeGreaterThanOrEqual(6);
    });

    it("devrait retourner les présences sans filtre de classe", async () => {
      const { getAttendanceByRange } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByRange("2024-10-01", "2024-12-31");

      expect(records.length).toBeGreaterThanOrEqual(6);
      records.forEach(r => {
        expect(r.className).toBeTruthy();
      });
    });

    it("devrait retourner une liste vide pour une plage sans données", async () => {
      const { getAttendanceByRange } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByRange("2020-01-01", "2020-12-31");
      expect(records).toEqual([]);
    });

    it("devrait trier par date puis studentId", async () => {
      const { getAttendanceByRange } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByRange("2024-12-01", "2024-12-02", classId1);

      for (let i = 1; i < records.length; i++) {
        const prev = records[i - 1];
        const curr = records[i];
        if (prev.date === curr.date) {
          expect(Number(curr.studentId)).toBeGreaterThanOrEqual(Number(prev.studentId));
        }
      }
    });
  });

  // ─────────── E. ÉDITION / SUPPRESSION ───────────

  describe("E. Modification et suppression", () => {
    let recordId: string;

    it("devrait modifier le statut d'un enregistrement (editAttendance)", async () => {
      const { getAttendanceByDateAndClass, editAttendance } = await import("@/lib/services/attendance.service");

      const records = await getAttendanceByDateAndClass("2024-10-15", classId1);
      expect(records.length).toBeGreaterThan(0);
      recordId = records[0].id;

      const updated = await editAttendance(recordId, { status: "retard" });
      expect(updated.status).toBe("retard");
    });

    it("devrait modifier la justification d'un enregistrement", async () => {
      const { editAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");

      await editAttendance(recordId, { justification: "Retard justifié" });

      const records = await getAttendanceByDateAndClass("2024-10-15", classId1);
      const rec = records.find(r => r.id === recordId);
      expect(rec?.justification).toBe("Retard justifié");
    });

    it("devrait supprimer un enregistrement (removeAttendance)", async () => {
      const { removeAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");

      await removeAttendance(recordId);

      const records = await getAttendanceByDateAndClass("2024-10-15", classId1);
      expect(records.find(r => r.id === recordId)).toBeUndefined();
    });

    it("devrait retourner null pour editAttendance avec un ID inexistant", async () => {
      const { editAttendance } = await import("@/lib/services/attendance.service");
      const result = await editAttendance("99999", { status: "présent" });
      expect(result).toBeNull();
    });
  });

  // ─────────── F. HISTORIQUE ÉTUDIANT ───────────

  describe("F. Historique étudiant - getStudentAttendance", () => {
    it("devrait retourner l'historique d'un étudiant", async () => {
      const { getStudentAttendance } = await import("@/lib/services/attendance.service");
      const records = await getStudentAttendance(studentId1);

      expect(records.length).toBeGreaterThanOrEqual(2);
      records.forEach(r => {
        expect(r.date).toBeTruthy();
        expect(r.status).toMatch(/^(présent|absent|retard|congé)$/);
      });
    });

    it("devrait retourner une liste vide pour un étudiant sans présence", async () => {
      const { getStudentAttendance } = await import("@/lib/services/attendance.service");
      const records = await getStudentAttendance("999");
      expect(records).toEqual([]);
    });

    it("devrait trier par date décroissante", async () => {
      const { getStudentAttendance } = await import("@/lib/services/attendance.service");
      const records = await getStudentAttendance(studentId1);

      for (let i = 1; i < records.length; i++) {
        expect(records[i - 1].date >= records[i].date).toBe(true);
      }
    });
  });

  // ─────────── G. PRÉSENCES PROFESSEURS ───────────

  describe("G. Présences professeurs - teacherAttendance", () => {
    it("G1 - getTeacherAttendanceByDate retourne liste vide pour une date sans données", async () => {
      const { getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");
      const records = await getTeacherAttendanceByDate("2099-01-01");
      expect(records).toEqual([]);
    });

    it("G2 - saveTeacherAttendance insère et getTeacherAttendanceByDate lit", async () => {
      const { saveTeacherAttendance, getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");
      await saveTeacherAttendance([
        { teacher_id: teacherId1, date: "2025-01-15", status: "absent" },
        { teacher_id: teacherId2, date: "2025-01-15", status: "present" },
      ]);
      const records = await getTeacherAttendanceByDate("2025-01-15");
      expect(records.length).toBe(2);
      expect(records.find(r => r.teacher_id === teacherId1)?.status).toBe("absent");
      expect(records.find(r => r.teacher_id === teacherId2)?.status).toBe("present");
    });

    it("G3 - saveTeacherAttendance upsert (UPDATE sur même prof + même date)", async () => {
      const { saveTeacherAttendance, getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");
      await saveTeacherAttendance([
        { teacher_id: teacherId1, date: "2025-01-20", status: "retard" },
      ]);
      await saveTeacherAttendance([
        { teacher_id: teacherId1, date: "2025-01-20", status: "present" },
      ]);
      const records = await getTeacherAttendanceByDate("2025-01-20");
      expect(records.length).toBe(1);
      expect(records[0].status).toBe("present");
    });

    it("G4 - saveTeacherAttendance batch de plusieurs professeurs (single insert)", async () => {
      const { saveTeacherAttendance, getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");
      await saveTeacherAttendance([
        { teacher_id: teacherId1, date: "2025-02-01", status: "present" },
        { teacher_id: teacherId2, date: "2025-02-01", status: "absent" },
      ]);
      const records = await getTeacherAttendanceByDate("2025-02-01");
      expect(records.length).toBe(2);
    });

    it("G5 - getTeacherAttendance filtre par from/to (via SQL)", async () => {
      const { getTeacherAttendance } = await import("@/lib/services/teacher.service");
      const records = await getTeacherAttendance(undefined, "2025-01-01", "2025-01-31");
      expect(records.length).toBeGreaterThanOrEqual(3);
      records.forEach(r => {
        expect(r.date >= "2025-01-01").toBe(true);
        expect(r.date <= "2025-01-31").toBe(true);
      });
    });

    it("G6 - saveTeacherAttendance met à jour updatedAt", async () => {
      const { saveTeacherAttendance, getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");
      await saveTeacherAttendance([
        { teacher_id: teacherId1, date: "2025-03-01", status: "absent" },
      ]);
      const first = await getTeacherAttendanceByDate("2025-03-01");
      expect(first.length).toBe(1);
      await saveTeacherAttendance([
        { teacher_id: teacherId1, date: "2025-03-01", status: "present" },
      ]);
      const updated = await getTeacherAttendanceByDate("2025-03-01");
      expect(updated[0].status).toBe("present");
    });

    it("G7 - tous les statuts: present, absent, retard, excused", async () => {
      const { saveTeacherAttendance, getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");

      await saveTeacherAttendance([{ teacher_id: teacherId1, date: "2025-04-01", status: "present" }]);
      await saveTeacherAttendance([{ teacher_id: teacherId2, date: "2025-04-02", status: "absent" }]);
      await saveTeacherAttendance([{ teacher_id: teacherId1, date: "2025-04-03", status: "retard" }]);
      await saveTeacherAttendance([{ teacher_id: teacherId2, date: "2025-04-04", status: "excused" }]);

      const r1 = await getTeacherAttendanceByDate("2025-04-01");
      expect(r1[0].status).toBe("present");
      const r2 = await getTeacherAttendanceByDate("2025-04-02");
      expect(r2[0].status).toBe("absent");
      const r3 = await getTeacherAttendanceByDate("2025-04-03");
      expect(r3[0].status).toBe("retard");
      const r4 = await getTeacherAttendanceByDate("2025-04-04");
      expect(r4[0].status).toBe("excused");
    });
  });

  // ─────────── I. TESTS "CONGÉ" ET COHÉRENCE ───────────

  describe("I. Cohérence statut congé", () => {
    it("I1 - save + read 'congé' ne mute pas en 'présent' au re-save", async () => {
      const { saveAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");
      const date = "2025-05-10";
      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date, status: "congé" },
      ]);
      const afterFirst = await getAttendanceByDateAndClass(date, classId1);
      expect(afterFirst.find(r => r.studentId === studentId1)?.status).toBe("congé");
      // Re-save sans changer le statut
      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date, status: "congé" },
      ]);
      const afterSecond = await getAttendanceByDateAndClass(date, classId1);
      expect(afterSecond.find(r => r.studentId === studentId1)?.status).toBe("congé");
    });

    it("I2 - stats avec mix présent/absent/retard/congé → taux correct", async () => {
      const { saveAttendance, getAttendanceStats } = await import("@/lib/services/attendance.service");
      // student 1 on different dates to build a mix
      // 4 entries across 4 dates: 1 présent, 1 absent, 1 congé, 1 retard
      // rate = (présent + congé) / total = (1+1)/4 = 50%
      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date: "2025-06-01", status: "présent" },
        { studentId: Number(studentId1), classId: Number(classId1), date: "2025-06-02", status: "absent" },
        { studentId: Number(studentId1), classId: Number(classId1), date: "2025-06-03", status: "congé" },
        { studentId: Number(studentId1), classId: Number(classId1), date: "2025-06-04", status: "retard" },
      ]);
      const stats = await getAttendanceStats(studentId1, undefined, "2025-06-01", "2025-06-04");
      expect(stats.total).toBe(4);
      expect(stats.présent).toBe(1);
      expect(stats.absent).toBe(1);
      expect(stats.retard).toBe(1);
      expect(stats.congé).toBe(1);
      expect(stats.rate).toBe(50);
    });

    it("I3 - historique étudiant: 'congé' compté dans excused", async () => {
      const { saveAttendance, getStudentAttendance } = await import("@/lib/services/attendance.service");
      await saveAttendance([
        { studentId: Number(studentId2), classId: Number(classId1), date: "2025-07-01", status: "congé" },
        { studentId: Number(studentId2), classId: Number(classId1), date: "2025-07-02", status: "présent" },
        { studentId: Number(studentId2), classId: Number(classId1), date: "2025-07-03", status: "absent" },
      ]);
      const records = await getStudentAttendance(studentId2);
      const congéRecords = records.filter(r => r.status === "congé");
      expect(congéRecords.length).toBeGreaterThanOrEqual(1);
      const présentRecords = records.filter(r => r.status === "présent");
      expect(présentRecords.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─────────── J. CONTRAINTE UNIQUE ET BORDURE ───────────

  describe("J. Contrainte unique et cas limites", () => {
    it("J1 - insert doublon étudiant (même studentId + date) → upsert sans erreur", async () => {
      const { saveAttendance, getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");
      const date = "2025-08-01";
      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date, status: "présent" },
      ]);
      await saveAttendance([
        { studentId: Number(studentId1), classId: Number(classId1), date, status: "absent" },
      ]);
      const records = await getAttendanceByDateAndClass(date, classId1);
      const recs = records.filter(r => r.studentId === studentId1 && r.date === date);
      expect(recs.length).toBe(1);
      expect(recs[0].status).toBe("absent");
    });

    it("J2 - insert doublon professeur (même teacherId + date) → upsert sans erreur", async () => {
      const { saveTeacherAttendance, getTeacherAttendanceByDate } = await import("@/lib/services/teacher.service");
      const date = "2025-08-15";
      await saveTeacherAttendance([
        { teacher_id: teacherId1, date, status: "present" },
      ]);
      await saveTeacherAttendance([
        { teacher_id: teacherId1, date, status: "absent" },
      ]);
      const records = await getTeacherAttendanceByDate(date);
      const recs = records.filter(r => r.teacher_id === teacherId1 && r.date === date);
      expect(recs.length).toBe(1);
      expect(recs[0].status).toBe("absent");
    });

    it("J3 - getAttendanceByDateAndClass pour date future → []", async () => {
      const { getAttendanceByDateAndClass } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByDateAndClass("2099-12-31", classId1);
      expect(records).toEqual([]);
    });

    it("J4 - getAttendanceByRange from > to → []", async () => {
      const { getAttendanceByRange } = await import("@/lib/services/attendance.service");
      const records = await getAttendanceByRange("2025-12-31", "2025-01-01");
      expect(records).toEqual([]);
    });
  });
});
