import { describe, it, expect, beforeAll, afterAll } from "vitest"
import path from "path"
import fs from "fs"
import type Database from "better-sqlite3"

const PROD_DB_PATH = path.join(process.cwd(), "ekima_db/data.db")

let db: Database.Database

beforeAll(() => {
  const BetterSqlite3 = require("better-sqlite3") as typeof import("better-sqlite3")
  db = new BetterSqlite3(PROD_DB_PATH)
})

afterAll(() => {
  db.close()
})

describe("Seed integrity — base de production", () => {
  it("1 - fichier de base de production existe", () => {
    expect(fs.existsSync(PROD_DB_PATH)).toBe(true)
  })

  it("2 - année académique courante (is_current = 1)", () => {
    const rows = db.prepare("SELECT id, name, is_current FROM academic_years WHERE is_current = 1").all() as { id: number; name: string; is_current: number }[]
    expect(rows.length).toBeGreaterThanOrEqual(1)
    expect(rows[0].is_current).toBe(1)
  })

  it("3 - une seule année courante", () => {
    const count = (db.prepare("SELECT COUNT(*) c FROM academic_years WHERE is_current = 1").get() as { c: number }).c
    expect(count).toBe(1)
  })

  it("4 - informations de l'école existent", () => {
    const rows = db.prepare("SELECT id, name FROM school_info LIMIT 1").all() as { id: number; name: string }[]
    expect(rows.length).toBe(1)
    expect(rows[0].name).toBeTruthy()
  })

  it("5 - au moins un type de frais (fee_types)", () => {
    const count = (db.prepare("SELECT COUNT(*) c FROM fee_types").get() as { c: number }).c
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it("6 - au moins une classe", () => {
    const count = (db.prepare("SELECT COUNT(*) c FROM classes").get() as { c: number }).c
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it("7 - au moins une matière (subjects)", () => {
    const count = (db.prepare("SELECT COUNT(*) c FROM subjects").get() as { c: number }).c
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it("8 - au moins un élève avec inscription active", () => {
    const rows = db.prepare(`
      SELECT COUNT(*) c FROM enrollments e
      JOIN students s ON s.id = e.student_id
      WHERE e.status = 'inscrit'
    `).get() as { c: number }
    expect(rows.c).toBeGreaterThanOrEqual(1)
  })

  it("9 - au moins un enseignant", () => {
    const count = (db.prepare("SELECT COUNT(*) c FROM teachers WHERE status = 'active'").get() as { c: number }).c
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it("10 - utilisateur admin existe avec rôle admin", () => {
    const rows = db.prepare("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1").all() as { id: number; email: string; role: string }[]
    expect(rows.length).toBe(1)
    expect(rows[0].role).toBe("admin")
  })
})
