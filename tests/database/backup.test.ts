import { describe, it, expect, beforeAll, afterAll } from "vitest"
import path from "path"
import fs from "fs"
import { TEST_DB_PATH, setupTestDatabase, teardownTestDatabase } from "../helpers/setup"

let backup: typeof import("@/lib/backup")

beforeAll(async () => {
  await setupTestDatabase()
  backup = await import("@/lib/backup")
})

afterAll(() => {
  const dir = path.join(path.dirname(TEST_DB_PATH), "backups")
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
  teardownTestDatabase()
})

describe("Backup service", () => {
  it("1 - crée une sauvegarde et retourne ses infos", () => {
    const info = backup.createBackup()
    expect(info.filename).toMatch(/^data-\d{4}-\d{2}-\d{2}-\d{6}\.db$/)
    expect(info.sizeBytes).toBeGreaterThan(0)
    expect(info.createdAt).toBeTruthy()
    const fullPath = path.join(path.dirname(TEST_DB_PATH), "backups", info.filename)
    expect(fs.existsSync(fullPath)).toBe(true)
  })

  it("2 - liste les sauvegardes du plus récent au plus ancien", () => {
    const list = backup.getBackups()
    expect(list.length).toBeGreaterThanOrEqual(1)
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].createdAt.localeCompare(list[i].createdAt)).toBeGreaterThanOrEqual(0)
    }
  })

  it("3 - supprime une sauvegarde", () => {
    const list1 = backup.getBackups()
    const toDelete = list1[list1.length - 1]
    backup.deleteBackup(toDelete.filename)
    const list2 = backup.getBackups()
    expect(list2.find(b => b.filename === toDelete.filename)).toBeUndefined()
  })

  it("4 - ne garde que N sauvegardes après pruneBackups", () => {
    for (let i = 0; i < 5; i++) {
      backup.createBackup()
    }
    backup.pruneBackups(3)
    const list = backup.getBackups()
    expect(list.length).toBeLessThanOrEqual(3)
  })

  it("5 - restaure une sauvegarde", () => {
    const initial = backup.createBackup()
    expect(() => backup.restoreBackup(initial.filename)).not.toThrow()
    const dbPath = TEST_DB_PATH
    expect(fs.existsSync(dbPath)).toBe(true)
  })

  it("6 - lance une erreur si backup introuvable", () => {
    expect(() => backup.restoreBackup("inexistant.db")).toThrow(/introuvable/)
    expect(() => backup.deleteBackup("inexistant.db")).toThrow(/introuvable/)
  })

  it("7 - getBackups retourne un tableau vide si aucun backup", () => {
    const dir = path.join(path.dirname(TEST_DB_PATH), "backups")
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
    const list = backup.getBackups()
    expect(list).toEqual([])
  })
})
