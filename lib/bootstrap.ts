import { sql } from "drizzle-orm";

let initialized = false;

async function getDbAndRepositories() {
  const [{ db, checkDatabaseConnection }, { countUsers, createUser, findUserByEmail, updateUserPasswordHash }, { hashPassword }] = await Promise.all([
    import("@/lib/db"),
    import("@/lib/repositories/user.repository"),
    import("@/lib/auth/password"),
  ]);

  return { db, checkDatabaseConnection, countUsers, createUser, findUserByEmail, updateUserPasswordHash, hashPassword };
}

async function ensureAuthSchema(db: any) {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      email text NOT NULL UNIQUE,
      full_name text NOT NULL,
      password_hash text,
      created_at integer
    )
  `);

  try {
    await db.run(sql`ALTER TABLE users ADD COLUMN password_hash text`);
  } catch {
    // Column already exists.
  }

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users_auth_migration (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      email text NOT NULL UNIQUE,
      full_name text NOT NULL,
      password_hash text,
      created_at integer
    )
  `);

  await db.run(sql`
    INSERT OR IGNORE INTO users_auth_migration (id, email, full_name, password_hash, created_at)
    SELECT id, email, full_name, password_hash, created_at FROM users
  `);

  await db.run(sql`DROP TABLE users`);
  await db.run(sql`ALTER TABLE users_auth_migration RENAME TO users`);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)`);
}

export async function initializeApp() {
  if (initialized) return;

  const { db, checkDatabaseConnection, countUsers, createUser, findUserByEmail, updateUserPasswordHash, hashPassword } =
    await getDbAndRepositories();

  const isDbConnected = await checkDatabaseConnection();
  if (!isDbConnected) {
    console.error("[EduMali] Echec connexion base de donnees SQLite.");
    return;
  }

  console.log("[EduMali] Connexion base de donnees SQLite: SUCCESS");
  await ensureAuthSchema(db);

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@edumali.ml";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";
  const passwordHash = await hashPassword(adminPassword);
  const usersCount = await countUsers();

  if (usersCount === 0) {
    await createUser({
      email: adminEmail,
      fullName: "Administrateur",
      passwordHash,
    });

    console.log(`[EduMali] Utilisateur admin cree: ${adminEmail}`);
  } else {
    const admin = await findUserByEmail(adminEmail);
    if (!admin) {
      await createUser({
        email: adminEmail,
        fullName: "Administrateur",
        passwordHash,
      });

      console.log(`[EduMali] Utilisateur admin cree: ${adminEmail}`);
    } else if (!admin.passwordHash?.startsWith("pbkdf2:")) {
      await updateUserPasswordHash(admin.id, passwordHash);
      console.log(`[EduMali] Hash du mot de passe admin mis a jour: ${adminEmail}`);
    }
  }

  initialized = true;
}
