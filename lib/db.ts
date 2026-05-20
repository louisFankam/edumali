import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./models/schema";

const databasePath = `${process.cwd()}/edumali_db/data.db`;
const sqlite = new Database(databasePath);

export const db = drizzle(sqlite, { schema });

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    sqlite.prepare("select 1").get();
    return true;
  } catch {
    return false;
  }
}
