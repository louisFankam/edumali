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
      role text NOT NULL DEFAULT 'manager',
      created_at integer
    )
  `);

  try {
    await db.run(sql`ALTER TABLE users ADD COLUMN password_hash text`);
  } catch {
    // Column already exists.
  }

  try {
    await db.run(sql`ALTER TABLE users ADD COLUMN role text NOT NULL DEFAULT 'manager'`);
  } catch {
    // Column already exists.
  }

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users_auth_migration (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      email text NOT NULL UNIQUE,
      full_name text NOT NULL,
      password_hash text,
      role text NOT NULL DEFAULT 'manager',
      created_at integer
    )
  `);

  await db.run(sql`
    INSERT OR IGNORE INTO users_auth_migration (id, email, full_name, password_hash, role, created_at)
    SELECT id, email, full_name, password_hash, COALESCE(role, 'manager'), created_at FROM users
  `);

  await db.run(sql`PRAGMA foreign_keys = OFF`);
  await db.run(sql`DROP TABLE IF EXISTS users`);
  await db.run(sql`ALTER TABLE users_auth_migration RENAME TO users`);
  await db.run(sql`PRAGMA foreign_keys = ON`);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS classes (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL UNIQUE,
      level integer,
      capacity integer DEFAULT 0,
      total_fee real DEFAULT 0,
      teacher_id integer,
      color text DEFAULT '#6366f1',
      academic_year text DEFAULT '',
      status text NOT NULL DEFAULT 'active',
      created_at integer,
      updated_at integer
    )
  `);

  try { await db.run(sql`ALTER TABLE classes ADD COLUMN capacity integer DEFAULT 0`); } catch {}
  try { await db.run(sql`ALTER TABLE classes ADD COLUMN total_fee real DEFAULT 0`); } catch {}
  try { await db.run(sql`ALTER TABLE classes ADD COLUMN teacher_id integer`); } catch {}
  try { await db.run(sql`ALTER TABLE classes ADD COLUMN color text DEFAULT '#6366f1'`); } catch {}
  try { await db.run(sql`ALTER TABLE classes ADD COLUMN academic_year text DEFAULT ''`); } catch {}
  try { await db.run(sql`ALTER TABLE classes ADD COLUMN status text NOT NULL DEFAULT 'active'`); } catch {}

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
      discount_type text,
      discount_value real,
      discount_reason text,
      created_at integer,
      updated_at integer
    )
  `);

  try { await db.run(sql`ALTER TABLE students ADD COLUMN discount_type text`); } catch {}
  try { await db.run(sql`ALTER TABLE students ADD COLUMN discount_value real`); } catch {}
  try { await db.run(sql`ALTER TABLE students ADD COLUMN discount_reason text`); } catch {}

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
    CREATE TABLE IF NOT EXISTS fees (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      amount real NOT NULL DEFAULT 0,
      period text NOT NULL DEFAULT 'annuel',
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
    CREATE TABLE IF NOT EXISTS class_fee_types (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      class_id integer NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      fee_type_id integer NOT NULL REFERENCES fee_types(id) ON DELETE CASCADE,
      amount real,
      created_at integer,
      updated_at integer,
      UNIQUE(class_id, fee_type_id)
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
    CREATE TABLE IF NOT EXISTS teachers (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      email text NOT NULL UNIQUE,
      phone text,
      address text,
      gender text NOT NULL CHECK(gender IN ('Masculin', 'Féminin')),
      hire_date text NOT NULL,
      salary real DEFAULT 0,
      hours_per_day integer DEFAULT 4,
      contrat text NOT NULL DEFAULT 'mensuel' CHECK(contrat IN ('horaire', 'mensuel')),
      status text NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'on_leave')),
      photo text,
      user_id integer REFERENCES users(id),
      created_at integer,
      updated_at integer
    )
  `);
  try { await db.run(sql`ALTER TABLE teachers ADD COLUMN hours_per_day integer DEFAULT 4`); } catch {}

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS teacher_subjects (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      teacher_id integer NOT NULL REFERENCES teachers(id),
      subject_id integer NOT NULL REFERENCES subjects(id)
    )
  `);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS ts_teacher_subject ON teacher_subjects (teacher_id, subject_id)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS teacher_attendance (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      teacher_id integer NOT NULL REFERENCES teachers(id),
      date text NOT NULL,
      status text NOT NULL DEFAULT 'present' CHECK(status IN ('present', 'absent', 'retard', 'excused')),
      justification text,
      created_at integer,
      updated_at integer
    )
  `);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS ta_teacher_date ON teacher_attendance (teacher_id, date)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS payroll (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      teacher_id integer NOT NULL REFERENCES teachers(id),
      month integer NOT NULL,
      year integer NOT NULL,
      amount real NOT NULL,
      bonus real DEFAULT 0,
      deductions real DEFAULT 0,
      paid_at text,
      notes text,
      created_at integer,
      updated_at integer
    )
  `);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS pay_teacher_month_year ON payroll (teacher_id, month, year)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS medical_infos (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_id integer NOT NULL UNIQUE REFERENCES students(id),
      blood_type text,
      allergies text,
      medical_conditions text,
      medications text,
      doctor_name text,
      doctor_phone text,
      emergency_contact text,
      emergency_phone text,
      vaccination_status text,
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS family_infos (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_id integer NOT NULL UNIQUE REFERENCES students(id),
      father_name text,
      father_phone text,
      father_profession text,
      mother_name text,
      mother_phone text,
      mother_profession text,
      guardian_name text,
      guardian_relation text,
      guardian_phone text,
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS academic_histories (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_id integer NOT NULL REFERENCES students(id),
      school_name text NOT NULL,
      class_name text,
      academic_year text,
      reason text,
      remarks text,
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS class_subjects (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      class_id integer NOT NULL REFERENCES classes(id),
      subject_id integer NOT NULL REFERENCES subjects(id),
      coefficient integer NOT NULL DEFAULT 1,
      UNIQUE(class_id, subject_id)
    )
  `);

  try { await db.run(sql`ALTER TABLE class_subjects ADD COLUMN teacher_id integer REFERENCES teachers(id)`); } catch {}

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS evaluations (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      type text NOT NULL CHECK(type IN ('devoir', 'trimestrielle')),
      class_id integer NOT NULL REFERENCES classes(id),
      subject_id integer NOT NULL REFERENCES subjects(id),
      trimester integer NOT NULL,
      academic_year_id integer NOT NULL REFERENCES academic_years(id),
      date text NOT NULL,
      status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS eval_unique_period ON evaluations (class_id, subject_id, trimester, type)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS grades (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      evaluation_id integer NOT NULL REFERENCES evaluations(id),
      student_id integer NOT NULL REFERENCES students(id),
      score real NOT NULL,
      remarks text,
      created_at integer,
      updated_at integer
    )
  `);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS grade_eval_student ON grades (evaluation_id, student_id)`);
  try { db.run(sql`ALTER TABLE grades ADD COLUMN is_absent integer DEFAULT 0`); } catch {}

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
  try { db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_student_year ON enrollments (student_id, academic_year_id)`); } catch {};

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      description text NOT NULL,
      amount real NOT NULL,
      category text NOT NULL CHECK(category IN ('eau', 'electricite', 'fournitures', 'entretien', 'transport', 'equipement', 'autres')),
      category_custom text,
      date text NOT NULL,
      notes text,
      created_at integer,
      updated_at integer
    )
  `);
  try { await db.run(sql`ALTER TABLE expenses ADD COLUMN academic_year_id integer REFERENCES academic_years(id)`); } catch {}

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS closed_periods (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      month integer NOT NULL,
      year integer NOT NULL,
      closed_at integer,
      created_at integer
    )
  `);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS cp_month_year ON closed_periods (month, year)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      table_name text NOT NULL,
      record_id integer NOT NULL,
      action text NOT NULL CHECK(action IN ('create', 'update', 'delete')),
      user_id integer,
      old_values text,
      new_values text,
      created_at integer
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS school_events (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      title text NOT NULL,
      description text,
      type text NOT NULL DEFAULT 'event' CHECK(type IN ('holiday', 'event', 'meeting', 'exam', 'deadline')),
      start_date text NOT NULL,
      end_date text,
      start_time text,
      end_time text,
      all_day integer NOT NULL DEFAULT 1,
      color text,
      created_at integer,
      updated_at integer
    )
  `);
  try { await db.run(sql`ALTER TABLE school_events ADD COLUMN color text`); } catch {}

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS schedules (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      class_id integer NOT NULL REFERENCES classes(id),
      academic_year_id integer NOT NULL REFERENCES academic_years(id),
      day integer NOT NULL,
      start_time text NOT NULL,
      end_time text NOT NULL,
      subject_id integer REFERENCES subjects(id),
      teacher_id integer REFERENCES teachers(id),
      created_at integer,
      updated_at integer
    )
  `);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules (class_id, academic_year_id)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS exams (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      class_id integer NOT NULL REFERENCES classes(id),
      academic_year_id integer NOT NULL REFERENCES academic_years(id),
      subject_id integer NOT NULL REFERENCES subjects(id),
      teacher_id integer REFERENCES teachers(id),
      trimester integer NOT NULL,
      date text NOT NULL,
      start_time text NOT NULL,
      end_time text NOT NULL,
      room text DEFAULT '',
      status text DEFAULT 'draft',
      created_at integer,
      updated_at integer
    )
  `);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_exams_class ON exams (class_id, academic_year_id, trimester)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id integer NOT NULL UNIQUE REFERENCES users(id),
      theme text NOT NULL DEFAULT 'light' CHECK(theme IN ('light', 'dark', 'auto')),
      primary_color text NOT NULL DEFAULT '#dc2626',
      secondary_color text NOT NULL DEFAULT '#3b82f6',
      accent_color text NOT NULL DEFAULT '#10b981',
      sidebar_color text NOT NULL DEFAULT '#374151',
      sidebar_text_color text NOT NULL DEFAULT '#ffffff',
      border_radius text NOT NULL DEFAULT 'medium' CHECK(border_radius IN ('none', 'small', 'medium', 'large')),
      font_size text NOT NULL DEFAULT 'medium' CHECK(font_size IN ('small', 'medium', 'large')),
      font_family text NOT NULL DEFAULT 'Inter, sans-serif',
      dense_mode integer NOT NULL DEFAULT 0,
      compact_sidebar integer NOT NULL DEFAULT 0,
      animations integer NOT NULL DEFAULT 1,
      high_contrast integer NOT NULL DEFAULT 0,
      created_at integer,
      updated_at integer
    )
  `);

  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_payments_date ON payments (date)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_payments_student ON payments (student_id)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance (class_id, date)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_attendance_status_date ON attendance (status, date)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_students_status ON students (status)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_students_registration ON students (registration_date)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_students_class_status ON students (class_id, status)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_exams_date ON exams (date)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations (status)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_grades_score ON grades (is_absent, score)`);
}

export function resetBootstrap() {
  initialized = false;
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

  const adminEmail = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";
  const passwordHash = await hashPassword(adminPassword);
  const usersCount = await countUsers();

  if (usersCount === 0) {
    await createUser({
      email: adminEmail,
      fullName: "Administrateur",
      passwordHash,
      role: "admin",
    });

    console.log(`[EduMali] Utilisateur admin cree: ${adminEmail}`);
  } else {
    const admin = await findUserByEmail(adminEmail);
    if (!admin) {
      await createUser({
        email: adminEmail,
        fullName: "Administrateur",
        passwordHash,
        role: "admin",
      });

      console.log(`[EduMali] Utilisateur admin cree: ${adminEmail}`);
    } else if (!admin.passwordHash?.startsWith("pbkdf2:")) {
      await updateUserPasswordHash(admin.id, passwordHash);
      console.log(`[EduMali] Hash du mot de passe admin mis a jour: ${adminEmail}`);
    }

    if (admin && admin.role !== "admin") {
      const { updateUser } = await import("@/lib/repositories/user.repository");
      await updateUser(admin.id, { role: "admin" });
      console.log(`[EduMali] Role admin attribue a l'utilisateur existant: ${adminEmail}`);
    }
  }

  initialized = true;
}
