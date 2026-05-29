import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH } from "../helpers/setup";
import { sql } from "drizzle-orm";

describe("Dashboard - Filtrage par année scolaire", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("devrait filtrer les présences par plage de dates de l'année scolaire", async () => {
    const { db } = await import("@/lib/db");

    const [year] = db.all(sql`
      SELECT id, start_date, end_date FROM academic_years WHERE is_current = 1 LIMIT 1
    `) as { id: number; start_date: string; end_date: string }[];

    db.run(sql`PRAGMA foreign_keys = OFF`);

    // Présence dans l'année scolaire courante
    db.run(sql`
      INSERT OR IGNORE INTO attendance (student_id, class_id, date, status)
      VALUES (1, 1, ${year.start_date}, 'présent')
    `);

    // Présence en dehors de l'année scolaire
    db.run(sql`
      INSERT OR IGNORE INTO attendance (student_id, class_id, date, status)
      VALUES (1, 1, '2020-10-15', 'présent')
    `);

    db.run(sql`PRAGMA foreign_keys = ON`);

    // Filtre par date >= start_date AND date <= end_date
    const [result] = db.all(sql`
      SELECT COUNT(*) as cnt FROM attendance a
      WHERE a.date >= ${year.start_date} AND a.date <= ${year.end_date}
    `) as { cnt: number }[];

    expect(result.cnt).toBe(1);
  });

  it("devrait filtrer les paiements par plage de dates de l'année scolaire", async () => {
    const { db } = await import("@/lib/db");

    const [year] = db.all(sql`
      SELECT id, start_date, end_date FROM academic_years WHERE is_current = 1 LIMIT 1
    `) as { id: number; start_date: string; end_date: string }[];

    db.run(sql`PRAGMA foreign_keys = OFF`);

    // Paiement dans l'année scolaire
    db.run(sql`
      INSERT OR IGNORE INTO payments (student_id, amount, method, date, status)
      VALUES (1, 50000, 'espèces', ${year.start_date}, 'payé')
    `);

    // Paiement en dehors de l'année scolaire
    db.run(sql`
      INSERT OR IGNORE INTO payments (student_id, amount, method, date, status)
      VALUES (1, 100000, 'espèces', '2020-05-01', 'payé')
    `);

    db.run(sql`PRAGMA foreign_keys = ON`);

    const [result] = db.all(sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments p
      WHERE p.status = 'payé' AND p.date >= ${year.start_date} AND p.date <= ${year.end_date}
    `) as { total: number }[];

    expect(result.total).toBe(50000);
  });

  it("devrait filtrer les évaluations par academic_year_id", async () => {
    const { db } = await import("@/lib/db");

    const [currentYear] = db.all(sql`
      SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1
    `) as { id: number }[];

    const [subject] = db.all(sql`SELECT id FROM subjects LIMIT 1`) as { id: number }[];
    const [cls] = db.all(sql`SELECT id FROM classes LIMIT 1`) as { id: number }[];

    // Créer une seconde année non courante
    db.run(sql`
      INSERT OR IGNORE INTO academic_years (name, start_date, end_date, is_current)
      VALUES ('2020-2021', '2020-09-01', '2021-08-31', 0)
    `);
    const [pastYear] = db.all(sql`
      SELECT id FROM academic_years WHERE is_current = 0 AND name = '2020-2021' LIMIT 1
    `) as { id: number }[];

    // Évaluation pour l'année courante
    db.run(sql`
      INSERT OR IGNORE INTO evaluations (name, class_id, subject_id, trimester, academic_year_id, date, type, status)
      VALUES ('Devoir courant', ${cls.id}, ${subject.id}, 1, ${currentYear.id}, '2025-10-15', 'devoir', 'published')
    `);

    // Évaluation pour l'année passée
    if (pastYear && pastYear.id !== currentYear.id) {
      db.run(sql`
        INSERT OR IGNORE INTO evaluations (name, class_id, subject_id, trimester, academic_year_id, date, type, status)
        VALUES ('Ancien devoir', ${cls.id}, ${subject.id}, 1, ${pastYear.id}, '2020-10-15', 'devoir', 'published')
      `);
    }

    const [evalCurrent] = db.all(sql`
      SELECT id FROM evaluations WHERE academic_year_id = ${currentYear.id} LIMIT 1
    `) as { id: number }[];
    if (evalCurrent) {
      db.run(sql`
        INSERT OR IGNORE INTO grades (evaluation_id, student_id, score)
        VALUES (${evalCurrent.id}, 1, 15.0)
      `);
    }

    const [result] = db.all(sql`
      SELECT COUNT(*) as cnt FROM evaluations e
      WHERE e.status = 'published' AND e.academic_year_id = ${currentYear.id}
    `) as { cnt: number }[];

    expect(result.cnt).toBe(1);
  });
});
