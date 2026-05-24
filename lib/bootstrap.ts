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

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS classes (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL UNIQUE,
      level integer,
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    INSERT OR IGNORE INTO classes (id, name, level) VALUES
      (1, '1ère Année', 1),
      (2, '2ème Année', 2),
      (3, '3ème Année', 3),
      (4, '4ème Année', 4),
      (5, '5ème Année', 5),
      (6, '6ème Année', 6)
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS students (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      gender text NOT NULL CHECK(gender IN ('Masculin', 'Féminin')),
      birth_date text NOT NULL,
      nationality text,
      photo text,
      parent_name text NOT NULL,
      parent_phone text NOT NULL,
      address text,
      class_id integer NOT NULL REFERENCES classes(id),
      registration_date text NOT NULL,
      status text NOT NULL DEFAULT 'Actif' CHECK(status IN ('Actif', 'Inactif')),
      created_at integer,
      updated_at integer
    )
  `);

  const countRow = db.get(sql`SELECT COUNT(*) as count FROM students`) as { count: number } | undefined;
  const studentCount = countRow?.count ?? 0;

  if (studentCount === 0) {
    await db.run(sql`
      INSERT INTO students (first_name, last_name, gender, birth_date, nationality, parent_name, parent_phone, class_id, registration_date, status)
      VALUES
        ('Amadou', 'Diallo', 'Masculin', '2015-05-12', 'Malienne', 'Moussa Diallo', '70123456', 1, '2024-09-01', 'Actif'),
        ('Fatoumata', 'Traoré', 'Féminin', '2015-08-22', 'Malienne', 'Oumar Traoré', '66123456', 1, '2024-09-05', 'Actif')
    `);
    console.log("[EduMali] 2 élèves de démonstration créés");
  }
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
