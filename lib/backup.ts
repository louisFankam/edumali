import fs from "fs";
import path from "path";
import { databasePath, rawDb } from "@/lib/db";

const BACKUP_DIR_NAME = "backups";
const MAX_BACKUPS = 30;
const CHECK_INTERVAL_MS = 30 * 60 * 1000;
const EVENING_HOUR = 18;

export interface BackupInfo {
  filename: string
  sizeBytes: number
  createdAt: string
}

function getBackupDir(): string {
  return path.join(path.dirname(databasePath), BACKUP_DIR_NAME);
}

function ensureBackupDir(): void {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function now(): Date {
  return new Date();
}

function todayStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function timestampStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}-${h}${min}${s}`;
}

function hasBackupToday(backups: BackupInfo[]): boolean {
  const today = todayStr(now());
  return backups.some((b) => b.filename.startsWith(`data-${today}`));
}

export function createBackup(): BackupInfo {
  ensureBackupDir();
  const date = now();
  const filename = `data-${timestampStr(date)}.db`;
  const destPath = path.join(getBackupDir(), filename);
  fs.copyFileSync(databasePath, destPath);
  const stats = fs.statSync(destPath);
  const info: BackupInfo = {
    filename,
    sizeBytes: stats.size,
    createdAt: stats.mtime.toISOString(),
  };
  pruneBackups(MAX_BACKUPS);
  return info;
}

export function getBackups(): BackupInfo[] {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith(".db") && f.startsWith("data-"))
    .map((f) => {
      const fullPath = path.join(dir, f);
      const stats = fs.statSync(fullPath);
      return {
        filename: f,
        sizeBytes: stats.size,
        createdAt: stats.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return files;
}

export function restoreBackup(filename: string): void {
  const backupPath = path.join(getBackupDir(), filename);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup introuvable: ${filename}`);
  }
  rawDb.pragma("wal_checkpoint(TRUNCATE)");
  fs.copyFileSync(backupPath, databasePath);
}

export function deleteBackup(filename: string): void {
  const backupPath = path.join(getBackupDir(), filename);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup introuvable: ${filename}`);
  }
  fs.unlinkSync(backupPath);
}

export function pruneBackups(maxCount: number = MAX_BACKUPS): void {
  const backups = getBackups();
  if (backups.length <= maxCount) return;
  const toDelete = backups.slice(maxCount);
  for (const b of toDelete) {
    const fullPath = path.join(getBackupDir(), b.filename);
    try { fs.unlinkSync(fullPath); } catch {}
  }
}

export function startDailyBackupScheduler(): void {
  const backups = getBackups();
  if (!hasBackupToday(backups)) {
    try {
      createBackup();
    } catch (e) {
      console.error("[Backup] Erreur backup automatique au demarrage:", e);
    }
  }
  setInterval(() => {
    const date = now();
    if (date.getHours() >= EVENING_HOUR) {
      const currentBackups = getBackups();
      if (!hasBackupToday(currentBackups)) {
        try {
          createBackup();
        } catch (e) {
          console.error("[Backup] Erreur backup automatique du soir:", e);
        }
      }
    }
  }, CHECK_INTERVAL_MS);
}
