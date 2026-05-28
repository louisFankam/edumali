import fs from "fs";
import path from "path";
import os from "os";

export const TEST_DB_PATH = path.join(os.tmpdir(), `edumali-test-${Date.now()}.db`);

export async function setupTestDatabase() {
  process.env.DB_PATH = TEST_DB_PATH;

  const mod = await import("@/lib/bootstrap");
  mod.resetBootstrap();
  await mod.initializeApp();
}

export async function teardownTestDatabase() {
  delete process.env.DB_PATH;
  try {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    const wal = TEST_DB_PATH + "-wal";
    const shm = TEST_DB_PATH + "-shm";
    if (fs.existsSync(wal)) fs.unlinkSync(wal);
    if (fs.existsSync(shm)) fs.unlinkSync(shm);
  } catch {
    // ignore cleanup errors
  }
}
