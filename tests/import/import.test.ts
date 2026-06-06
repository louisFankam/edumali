import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";
import { seedClass, seedAcademicYear } from "../helpers/seed";
import fs from "fs";
import path from "path";
import os from "os";

function createTempCsv(content: string): string {
  const fp = path.join(os.tmpdir(), `edumali-test-import-${Date.now()}.csv`);
  fs.writeFileSync(fp, content, "utf-8");
  return fp;
}

function readFileBuffer(fp: string): ArrayBuffer {
  const buf = fs.readFileSync(fp);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

describe("Import CSV/Excel - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    await seedClass({ name: "1ère Année" })
    await seedAcademicYear({ name: "2026-2027", isCurrent: true })
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("A. parseFile - Lecture CSV", () => {
    it("devrait parser un CSV valide avec virgules", async () => {
      const csv = `Nom,Prénom,Date de naissance,Sexe,Classe,Parent,Téléphone
Diallo,Mariam,2016-03-15,F,1ère Année,Moussa Diallo,70123457
Traoré,Ousmane,2015-11-20,M,1ère Année,Kadiatou Traoré,76123457`;

      const fp = createTempCsv(csv);
      const buffer = readFileBuffer(fp);
      const { parseFile } = await import("@/lib/services/import.service");
      const { rows } = await parseFile(buffer);
      fs.unlinkSync(fp);

      expect(rows.length).toBe(2);
      expect(rows[0].firstName).toBe("Mariam");
      expect(rows[0].lastName).toBe("Diallo");
      expect(rows[0].gender).toBe("Féminin");
      expect(rows[0].birthDate).toBe("2016-03-15");
      expect(rows[0].parentName).toBe("Moussa Diallo");
      expect(rows[0].parentPhone).toBe("70123457");
      expect(rows[0].errors).toEqual([]);

      expect(rows[1].firstName).toBe("Ousmane");
      expect(rows[1].lastName).toBe("Traoré");
      expect(rows[1].gender).toBe("Masculin");
      expect(rows[1].errors).toEqual([]);
    });

    it("devrait parser un CSV avec point-virgules", async () => {
      const csv = `Nom;Prénom;Date de naissance;Sexe;Classe;Parent;Téléphone
Diallo;Mariam;2016-03-15;F;1ère Année;Moussa Diallo;70123457
Traoré;Ousmane;2015-11-20;M;1ère Année;Kadiatou Traoré;76123457`;

      const fp = createTempCsv(csv);
      const buffer = readFileBuffer(fp);
      const { parseFile } = await import("@/lib/services/import.service");
      const { rows } = await parseFile(buffer);
      fs.unlinkSync(fp);

      expect(rows.length).toBe(2);
      expect(rows[0].firstName).toBe("Mariam");
      expect(rows[0].errors).toEqual([]);
    });

    it("devrait détecter les erreurs de validation", async () => {
      const csv = [
        ["Nom", "Prénom", "Date de naissance", "Sexe", "Classe", "Parent", "Téléphone"].join(","),
        [""    , "Mariam", "2016-03-15"        , "F"  , "1ère Année", "Moussa Diallo", "70123457"].join(","),
        ["Diallo", ""     , "2016-03-15"        , "F"  , "1ère Année", "Moussa Diallo", "70123457"].join(","),
        ["Diallo", "Mariam", "bad-date"         , "F"  , "1ère Année", "Moussa Diallo", "70123457"].join(","),
        ["Diallo", "Mariam", "2016-03-15"       , "X"  , "1ère Année", "Moussa Diallo", "70123457"].join(","),
        ["Diallo", "Mariam", "2016-03-15"       , "F"  , ""          , "Moussa Diallo", "70123457"].join(","),
        ["Diallo", "Mariam", "2016-03-15"       , "F"  , "ClasseInexistante", "Moussa Diallo", "70123457"].join(","),
      ].join("\n");

      const fp = createTempCsv(csv);
      const buffer = readFileBuffer(fp);
      const { parseFile } = await import("@/lib/services/import.service");
      const { rows } = await parseFile(buffer);
      fs.unlinkSync(fp);

      expect(rows.length).toBe(6);
      expect(rows[0].errors.some(e => e.includes("Nom"))).toBe(true);
      expect(rows[1].errors.some(e => e.includes("Prénom"))).toBe(true);
      expect(rows[2].errors.some(e => e.toLowerCase().includes("date"))).toBe(true);
      expect(rows[3].errors.some(e => e.includes("Sexe"))).toBe(true);
      expect(rows[4].errors.some(e => e.includes("Classe"))).toBe(true);
      expect(rows[5].errors.some(e => e.includes("Classe"))).toBe(true);
    });
  });

  describe("B. importStudents - Import en base", () => {
    it("devrait importer des élèves en base", async () => {
      const { findAllClasses } = await import("@/lib/repositories/class.repository");
      const classes = await findAllClasses();
      const firstClass = classes[0].name;

      const csv = [
        ["Nom", "Prénom", "Date de naissance", "Sexe", "Classe", "Parent", "Téléphone"].join(","),
        ["Diallo", "Mariam", "2016-03-15", "F", firstClass, "Moussa Diallo", "70123457"].join(","),
        ["Traoré", "Ousmane", "2015-11-20", "M", firstClass, "Kadiatou Traoré", "76123457"].join(","),
        ["Koné", "Aminata", "2017-08-10", "F", firstClass, "Fatoumata Koné", "72123457"].join(","),
      ].join("\n");

      const fp = createTempCsv(csv);
      const buffer = readFileBuffer(fp);
      const { parseFile, importStudents } = await import("@/lib/services/import.service");
      const { rows } = await parseFile(buffer);
      fs.unlinkSync(fp);

      const result = await importStudents(rows);
      expect(result.imported).toBe(3);
      expect(result.errors.length).toBe(0);

      const { getStudents } = await import("@/lib/services/student.service");
      const all = await getStudents();
      expect(all.total).toBeGreaterThanOrEqual(3);
    });

    it("devrait importer avec des réductions", async () => {
      const { findAllClasses } = await import("@/lib/repositories/class.repository");
      const classes = await findAllClasses();
      const firstClass = classes[0].name;

      const csv = [
        ["Nom", "Prénom", "Date de naissance", "Sexe", "Classe", "Parent", "Téléphone", "Réduction type", "Réduction valeur", "Raison"].join(","),
        ["Sissoko", "Aïcha", "2016-05-10", "F", firstClass, "Moussa Sissoko", "74123456", "pourcentage", "25", "Bourse mérite"].join(","),
        ["Coulibaly", "Drissa", "2015-09-30", "M", firstClass, "Adama Coulibaly", "75123456", "fixe", "20000", "Fratrie"].join(","),
      ].join("\n");

      const fp = createTempCsv(csv);
      const buffer = readFileBuffer(fp);
      const { parseFile, importStudents } = await import("@/lib/services/import.service");
      const { rows } = await parseFile(buffer);
      fs.unlinkSync(fp);

      expect(rows[0].discountType).toBe("percentage");
      expect(rows[0].discountValue).toBe(25);
      expect(rows[0].discountReason).toBe("Bourse mérite");
      expect(rows[1].discountType).toBe("fixed");
      expect(rows[1].discountValue).toBe(20000);
      expect(rows[1].discountReason).toBe("Fratrie");

      const result = await importStudents(rows);
      expect(result.imported).toBe(2);

      const { getStudentById, getStudents } = await import("@/lib/services/student.service");
      const all = await getStudents();
      const s1 = all.data.find(s => s.lastName === "Sissoko");
      expect(s1).toBeTruthy();
      if (s1) {
        const loaded = await getStudentById(s1.id);
        expect(loaded.discountType).toBe("percentage");
        expect(loaded.discountValue).toBe(25);
      }
    });

    it("devrait rapporter les erreurs d'import", async () => {
      const csv = [
        ["Nom", "Prénom", "Date de naissance", "Sexe", "Classe", "Parent", "Téléphone"].join(","),
        ["Test", "Erreur", "2016-01-01", "M", "ClasseInexistante", "Parent", "70000110"].join(","),
        ["Test2", "Erreur2", "2016-01-01", "", "1ère Année", "Parent", "70000111"].join(","),
      ].join("\n");

      const fp = createTempCsv(csv);
      const buffer = readFileBuffer(fp);
      const { parseFile, importStudents } = await import("@/lib/services/import.service");
      const { rows } = await parseFile(buffer);
      fs.unlinkSync(fp);

      const result = await importStudents(rows);
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});