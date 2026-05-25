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

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS school_info (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL DEFAULT '',
      address text DEFAULT '',
      phone text DEFAULT '',
      email text DEFAULT '',
      website text DEFAULT '',
      director text DEFAULT '',
      logo_url text DEFAULT '',
      founded_year integer,
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS academic_years (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      start_date text NOT NULL,
      end_date text NOT NULL,
      is_current integer NOT NULL DEFAULT 0,
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS subjects (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      code text DEFAULT '',
      coefficient integer DEFAULT 1,
      hours_per_week integer DEFAULT 0,
      description text DEFAULT '',
      color text DEFAULT '#6366f1',
      status text NOT NULL DEFAULT 'Actif' CHECK(status IN ('Actif', 'Inactif')),
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS fee_types (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      amount real NOT NULL DEFAULT 0,
      period text NOT NULL DEFAULT 'annuel' CHECK(period IN ('mensuel', 'trimestriel', 'annuel', 'unique')),
      description text DEFAULT '',
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS payments (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_id integer NOT NULL REFERENCES students(id),
      fee_type_id integer REFERENCES fee_types(id),
      amount real NOT NULL,
      method text NOT NULL DEFAULT 'espèces' CHECK(method IN ('espèces', 'virement', 'chèque', 'mobile_money')),
      reference text,
      date text NOT NULL,
      status text NOT NULL DEFAULT 'payé' CHECK(status IN ('payé', 'en_attente', 'annulé')),
      notes text,
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS attendance (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_id integer NOT NULL REFERENCES students(id),
      class_id integer NOT NULL REFERENCES classes(id),
      date text NOT NULL,
      status text NOT NULL DEFAULT 'présent' CHECK(status IN ('présent', 'absent', 'retard', 'congé')),
      justification text,
      created_at integer,
      updated_at integer
    )
  `);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS att_student_date ON attendance (student_id, date)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS enrollments (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_id integer NOT NULL REFERENCES students(id),
      class_id integer NOT NULL REFERENCES classes(id),
      academic_year_id integer NOT NULL REFERENCES academic_years(id),
      enrollment_date text NOT NULL,
      status text NOT NULL DEFAULT 'inscrit' CHECK(status IN ('inscrit', 'réinscrit', 'transféré', 'sorti')),
      notes text,
      created_at integer,
      updated_at integer
    )
  `);

  // Seed school_info if empty
  const schoolRow = db.get(sql`SELECT COUNT(*) as count FROM school_info`) as { count: number } | undefined;
  if (schoolRow?.count === 0) {
    const schoolName = process.env.SCHOOL_NAME ?? "École de Démonstration";
    await db.run(sql`INSERT INTO school_info (name) VALUES (${schoolName})`);
    console.log(`[EduMali] École créée: ${schoolName}`);
  }

  // Seed current academic year if empty
  const yearRow = db.get(sql`SELECT COUNT(*) as count FROM academic_years`) as { count: number } | undefined;
  if (yearRow?.count === 0) {
    const currentYear = new Date().getFullYear();
    await db.run(sql`
      INSERT INTO academic_years (name, start_date, end_date, is_current)
      VALUES (${`${currentYear}-${currentYear + 1}`}, ${`${currentYear}-09-01`}, ${`${currentYear + 1}-08-31`}, 1)
    `);
    console.log(`[EduMali] Année scolaire créée: ${currentYear}-${currentYear + 1}`);
  }

  // Seed sample subjects if empty
  const subjRow = db.get(sql`SELECT COUNT(*) as count FROM subjects`) as { count: number } | undefined;
  if (subjRow?.count === 0) {
    await db.run(sql`
      INSERT INTO subjects (name, code, coefficient, hours_per_week, color) VALUES
        ('Français', 'FR', 4, 6, '#ef4444'),
        ('Mathématiques', 'MA', 4, 6, '#3b82f6'),
        ('Sciences', 'SC', 3, 4, '#22c55e'),
        ('Histoire-Géographie', 'HG', 2, 3, '#f59e0b'),
        ('Anglais', 'AN', 2, 3, '#8b5cf6'),
        ('Education Physique', 'EP', 1, 2, '#ec4899')
    `);
    console.log("[EduMali] 6 matières de démonstration créées");
  }

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
