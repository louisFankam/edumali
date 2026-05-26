import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const classes = sqliteTable("classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  level: integer("level"),
  capacity: integer("capacity").default(0),
  totalFee: real("total_fee").default(0),
  teacherId: integer("teacher_id"),
  color: text("color").default("#6366f1"),
  academicYear: text("academic_year").default(""),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const students = sqliteTable("students", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender", { enum: ["Masculin", "Féminin"] }).notNull(),
  birthDate: text("birth_date").notNull(),
  nationality: text("nationality"),
  photo: text("photo"),
  parentName: text("parent_name").notNull(),
  parentPhone: text("parent_phone").notNull(),
  address: text("address"),
  classId: integer("class_id").notNull().references(() => classes.id),
  registrationDate: text("registration_date").notNull(),
  status: text("status", { enum: ["Actif", "Inactif"] }).notNull().default("Actif"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const schoolInfo = sqliteTable("school_info", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().default(""),
  address: text("address").default(""),
  phone: text("phone").default(""),
  email: text("email").default(""),
  website: text("website").default(""),
  director: text("director").default(""),
  logoUrl: text("logo_url").default(""),
  foundedYear: integer("founded_year"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const academicYears = sqliteTable("academic_years", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").default(""),
  coefficient: integer("coefficient").default(1),
  hoursPerWeek: integer("hours_per_week").default(0),
  description: text("description").default(""),
  color: text("color").default("#6366f1"),
  status: text("status", { enum: ["Actif", "Inactif"] }).notNull().default("Actif"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const feeTypes = sqliteTable("fee_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amount: real("amount").notNull().default(0),
  period: text("period", { enum: ["mensuel", "trimestriel", "annuel", "unique"] }).notNull().default("annuel"),
  description: text("description").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull().references(() => students.id),
  feeTypeId: integer("fee_type_id").references(() => feeTypes.id),
  amount: real("amount").notNull(),
  method: text("method", { enum: ["espèces", "virement", "chèque", "mobile_money"] }).notNull().default("espèces"),
  reference: text("reference"),
  date: text("date").notNull(),
  status: text("status", { enum: ["payé", "en_attente", "annulé"] }).notNull().default("payé"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull().references(() => students.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  date: text("date").notNull(),
  status: text("status", { enum: ["présent", "absent", "retard", "congé"] }).notNull().default("présent"),
  justification: text("justification"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  uniqueStudentDate: uniqueIndex("att_student_date").on(table.studentId, table.date),
}));

export const teachers = sqliteTable("teachers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  gender: text("gender", { enum: ["Masculin", "Féminin"] }).notNull(),
  hireDate: text("hire_date").notNull(),
  salary: real("salary").default(0),
  contrat: text("contrat", { enum: ["horaire", "mensuel"] }).notNull().default("mensuel"),
  status: text("status", { enum: ["active", "inactive", "on_leave"] }).notNull().default("active"),
  photo: text("photo"),
  userId: integer("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const teacherSubjects = sqliteTable("teacher_subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
}, (table) => ({
  uniqueTeacherSubject: uniqueIndex("ts_teacher_subject").on(table.teacherId, table.subjectId),
}));

export const teacherAttendance = sqliteTable("teacher_attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id),
  date: text("date").notNull(),
  status: text("status", { enum: ["present", "absent", "retard", "excused"] }).notNull().default("present"),
  justification: text("justification"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  uniqueTeacherDate: uniqueIndex("ta_teacher_date").on(table.teacherId, table.date),
}));

export const payroll = sqliteTable("payroll", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  amount: real("amount").notNull(),
  bonus: real("bonus").default(0),
  deductions: real("deductions").default(0),
  paidAt: text("paid_at"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  uniqueTeacherMonthYear: uniqueIndex("pay_teacher_month_year").on(table.teacherId, table.month, table.year),
}));

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  category: text("category", { enum: ["eau", "electricite", "fournitures", "entretien", "transport", "equipement", "autres"] }).notNull(),
  categoryCustom: text("category_custom"),
  date: text("date").notNull(),
  notes: text("notes"),
  academicYearId: integer("academic_year_id").references(() => academicYears.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const evaluations = sqliteTable("evaluations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["devoir", "trimestrielle"] }).notNull(),
  classId: integer("class_id").notNull().references(() => classes.id),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  trimester: integer("trimester").notNull(),
  academicYearId: integer("academic_year_id").notNull().references(() => academicYears.id),
  date: text("date").notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  uniqueEvalPeriod: uniqueIndex("eval_unique_period").on(table.classId, table.subjectId, table.trimester, table.type),
}));

export const grades = sqliteTable("grades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  evaluationId: integer("evaluation_id").notNull().references(() => evaluations.id),
  studentId: integer("student_id").notNull().references(() => students.id),
  score: real("score").notNull(),
  remarks: text("remarks"),
  isAbsent: integer("is_absent").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  uniqueEvalStudent: uniqueIndex("grade_eval_student").on(table.evaluationId, table.studentId),
}));

export const classSubjects = sqliteTable("class_subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  classId: integer("class_id").notNull().references(() => classes.id),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  coefficient: integer("coefficient").default(1).notNull(),
}, (table) => ({
  uniqueClassSubject: uniqueIndex("cs_class_subject").on(table.classId, table.subjectId),
}));

export const closedPeriods = sqliteTable("closed_periods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  closedAt: integer("closed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  uniqueMonthYear: uniqueIndex("cp_month_year").on(table.month, table.year),
}));

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tableName: text("table_name").notNull(),
  recordId: integer("record_id").notNull(),
  action: text("action", { enum: ["create", "update", "delete"] }).notNull(),
  userId: integer("user_id"),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const medicalInfos = sqliteTable("medical_infos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull().references(() => students.id).unique(),
  bloodType: text("blood_type"),
  allergies: text("allergies"),
  medicalConditions: text("medical_conditions"),
  medications: text("medications"),
  doctorName: text("doctor_name"),
  doctorPhone: text("doctor_phone"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  vaccinationStatus: text("vaccination_status"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const familyInfos = sqliteTable("family_infos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull().references(() => students.id).unique(),
  fatherName: text("father_name"),
  fatherPhone: text("father_phone"),
  fatherProfession: text("father_profession"),
  motherName: text("mother_name"),
  motherPhone: text("mother_phone"),
  motherProfession: text("mother_profession"),
  guardianName: text("guardian_name"),
  guardianRelation: text("guardian_relation"),
  guardianPhone: text("guardian_phone"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const academicHistories = sqliteTable("academic_histories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull().references(() => students.id),
  schoolName: text("school_name").notNull(),
  className: text("class_name"),
  academicYear: text("academic_year"),
  reason: text("reason"),
  remarks: text("remarks"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const enrollments = sqliteTable("enrollments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull().references(() => students.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  academicYearId: integer("academic_year_id").notNull().references(() => academicYears.id),
  enrollmentDate: text("enrollment_date").notNull(),
  status: text("status", { enum: ["inscrit", "réinscrit", "transféré", "sorti"] }).notNull().default("inscrit"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  theme: text("theme", { enum: ["light", "dark", "auto"] }).notNull().default("light"),
  primaryColor: text("primary_color").notNull().default("#dc2626"),
  secondaryColor: text("secondary_color").notNull().default("#3b82f6"),
  accentColor: text("accent_color").notNull().default("#10b981"),
  sidebarColor: text("sidebar_color").notNull().default("#374151"),
  sidebarTextColor: text("sidebar_text_color").notNull().default("#ffffff"),
  borderRadius: text("border_radius", { enum: ["none", "small", "medium", "large"] }).notNull().default("medium"),
  fontSize: text("font_size", { enum: ["small", "medium", "large"] }).notNull().default("medium"),
  fontFamily: text("font_family").notNull().default("Inter, sans-serif"),
  denseMode: integer("dense_mode", { mode: "boolean" }).notNull().default(false),
  compactSidebar: integer("compact_sidebar", { mode: "boolean" }).notNull().default(false),
  animations: integer("animations", { mode: "boolean" }).notNull().default(true),
  highContrast: integer("high_contrast", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Relations

export const classesRelations = relations(classes, ({ one, many }) => ({
  students: many(students),
  attendance: many(attendance),
  enrollments: many(enrollments),
  teacher: one(teachers, { fields: [classes.teacherId], references: [teachers.id] }),
  classSubjects: many(classSubjects),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  attendance: many(attendance),
  payments: many(payments),
  enrollments: many(enrollments),
  medicalInfo: one(medicalInfos, { fields: [students.id], references: [medicalInfos.studentId] }),
  familyInfo: one(familyInfos, { fields: [students.id], references: [familyInfos.studentId] }),
  academicHistories: many(academicHistories),
  grades: many(grades),
}));

export const feeTypesRelations = relations(feeTypes, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, { fields: [payments.studentId], references: [students.id] }),
  feeType: one(feeTypes, { fields: [payments.feeTypeId], references: [feeTypes.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, { fields: [attendance.studentId], references: [students.id] }),
  class: one(classes, { fields: [attendance.classId], references: [classes.id] }),
}));

export const academicYearsRelations = relations(academicYears, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  class: one(classes, { fields: [enrollments.classId], references: [classes.id] }),
  academicYear: one(academicYears, { fields: [enrollments.academicYearId], references: [academicYears.id] }),
}));

export const teachersRelations = relations(teachers, ({ many }) => ({
  subjects: many(teacherSubjects),
  attendance: many(teacherAttendance),
  payrolls: many(payroll),
}));

export const teacherSubjectsRelations = relations(teacherSubjects, ({ one }) => ({
  teacher: one(teachers, { fields: [teacherSubjects.teacherId], references: [teachers.id] }),
  subject: one(subjects, { fields: [teacherSubjects.subjectId], references: [subjects.id] }),
}));

export const teacherAttendanceRelations = relations(teacherAttendance, ({ one }) => ({
  teacher: one(teachers, { fields: [teacherAttendance.teacherId], references: [teachers.id] }),
}));

export const payrollRelations = relations(payroll, ({ one }) => ({
  teacher: one(teachers, { fields: [payroll.teacherId], references: [teachers.id] }),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  teachers: many(teacherSubjects),
  classSubjects: many(classSubjects),
}));

export const medicalInfosRelations = relations(medicalInfos, ({ one }) => ({
  student: one(students, { fields: [medicalInfos.studentId], references: [students.id] }),
}));

export const familyInfosRelations = relations(familyInfos, ({ one }) => ({
  student: one(students, { fields: [familyInfos.studentId], references: [students.id] }),
}));

export const academicHistoriesRelations = relations(academicHistories, ({ one }) => ({
  student: one(students, { fields: [academicHistories.studentId], references: [students.id] }),
}));

export const evaluationsRelations = relations(evaluations, ({ one, many }) => ({
  class: one(classes, { fields: [evaluations.classId], references: [classes.id] }),
  subject: one(subjects, { fields: [evaluations.subjectId], references: [subjects.id] }),
  academicYear: one(academicYears, { fields: [evaluations.academicYearId], references: [academicYears.id] }),
  grades: many(grades),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  evaluation: one(evaluations, { fields: [grades.evaluationId], references: [evaluations.id] }),
  student: one(students, { fields: [grades.studentId], references: [students.id] }),
}));

export const classSubjectsRelations = relations(classSubjects, ({ one }) => ({
  class: one(classes, { fields: [classSubjects.classId], references: [classes.id] }),
  subject: one(subjects, { fields: [classSubjects.subjectId], references: [subjects.id] }),
}));

export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  classId: integer("class_id").notNull().references(() => classes.id),
  academicYearId: integer("academic_year_id").notNull().references(() => academicYears.id),
  day: integer("day").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  subjectId: integer("subject_id").references(() => subjects.id),
  teacherId: integer("teacher_id").references(() => teachers.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const exams = sqliteTable("exams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  classId: integer("class_id").notNull().references(() => classes.id),
  academicYearId: integer("academic_year_id").notNull().references(() => academicYears.id),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  teacherId: integer("teacher_id").references(() => teachers.id),
  trimester: integer("trimester").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room").default(""),
  status: text("status", { enum: ["draft", "confirmed"] }).default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const closedPeriodsRelations = relations(closedPeriods, ({}) => ({}));

export const auditLogRelations = relations(auditLog, ({}) => ({}));
