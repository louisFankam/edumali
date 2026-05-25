CREATE TABLE `academic_years` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'présent' NOT NULL,
	`justification` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `att_student_date` ON `attendance` (`student_id`,`date`);--> statement-breakpoint
CREATE TABLE `classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`level` integer,
	`capacity` integer DEFAULT 0,
	`total_fee` real DEFAULT 0,
	`teacher_id` integer,
	`color` text DEFAULT '#6366f1',
	`academic_year` text DEFAULT '',
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classes_name_unique` ON `classes` (`name`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	`academic_year_id` integer NOT NULL,
	`enrollment_date` text NOT NULL,
	`status` text DEFAULT 'inscrit' NOT NULL,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fee_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`period` text DEFAULT 'annuel' NOT NULL,
	`description` text DEFAULT '',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`fee_type_id` integer,
	`amount` real NOT NULL,
	`method` text DEFAULT 'espèces' NOT NULL,
	`reference` text,
	`date` text NOT NULL,
	`status` text DEFAULT 'payé' NOT NULL,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payroll` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`amount` real NOT NULL,
	`bonus` real DEFAULT 0,
	`deductions` real DEFAULT 0,
	`paid_at` text,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pay_teacher_month_year` ON `payroll` (`teacher_id`,`month`,`year`);--> statement-breakpoint
CREATE TABLE `school_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '',
	`phone` text DEFAULT '',
	`email` text DEFAULT '',
	`website` text DEFAULT '',
	`director` text DEFAULT '',
	`logo_url` text DEFAULT '',
	`founded_year` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`gender` text NOT NULL,
	`birth_date` text NOT NULL,
	`nationality` text,
	`photo` text,
	`parent_name` text NOT NULL,
	`parent_phone` text NOT NULL,
	`address` text,
	`class_id` integer NOT NULL,
	`registration_date` text NOT NULL,
	`status` text DEFAULT 'Actif' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text DEFAULT '',
	`coefficient` integer DEFAULT 1,
	`hours_per_week` integer DEFAULT 0,
	`description` text DEFAULT '',
	`color` text DEFAULT '#6366f1',
	`status` text DEFAULT 'Actif' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `teacher_attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'present' NOT NULL,
	`justification` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ta_teacher_date` ON `teacher_attendance` (`teacher_id`,`date`);--> statement-breakpoint
CREATE TABLE `teacher_subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ts_teacher_subject` ON `teacher_subjects` (`teacher_id`,`subject_id`);--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`address` text,
	`gender` text NOT NULL,
	`hire_date` text NOT NULL,
	`salary` real DEFAULT 0,
	`contrat` text DEFAULT 'mensuel' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`photo` text,
	`user_id` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teachers_email_unique` ON `teachers` (`email`);