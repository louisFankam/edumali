import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
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

export const classesRelations = relations(classes, ({ many }) => ({
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one }) => ({
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
}));

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
