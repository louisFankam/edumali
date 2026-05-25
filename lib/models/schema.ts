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

// Relations

export const classesRelations = relations(classes, ({ many }) => ({
  students: many(students),
  attendance: many(attendance),
  enrollments: many(enrollments),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  attendance: many(attendance),
  payments: many(payments),
  enrollments: many(enrollments),
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
