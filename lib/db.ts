import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./models/schema";

export const databasePath = process.env.DB_PATH || path.join(process.cwd(), "ekima_db", "data.db");
const sqlite = new Database(databasePath);

export const db = drizzle(sqlite, { schema });

export const rawDb = sqlite;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    sqlite.prepare("select 1").get();
    return true;
  } catch {
    return false;
  }
}

export function getDatabaseStats() {
  const stats = fs.statSync(databasePath);
  const allTables = rawDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string }[];
  const tables = allTables.map(t => {
    const row = rawDb.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get() as { count: number };
    return { name: t.name, rowCount: row.count };
  });
  return {
    path: databasePath,
    sizeBytes: stats.size,
    lastModified: stats.mtime.toISOString(),
    tables,
  };
}

export function exportDatabase(destPath?: string) {
  const dest = destPath || databasePath;
  fs.copyFileSync(databasePath, dest);
  return dest;
}

export function importDatabase(sourcePath: string) {
  const backupPath = databasePath + `.backup-${Date.now()}`;
  fs.copyFileSync(databasePath, backupPath);
  fs.copyFileSync(sourcePath, databasePath);
  return backupPath;
}

export function clearTable(tableName: string) {
  const result = rawDb.prepare(`DELETE FROM "${tableName}"`).run();
  rawDb.prepare("VACUUM").run();
  return result.changes;
}
