CREATE TABLE `academic_histories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`school_name` text NOT NULL,
	`class_name` text,
	`academic_year` text,
	`reason` text,
	`remarks` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`table_name` text NOT NULL,
	`record_id` integer NOT NULL,
	`action` text NOT NULL,
	`user_id` integer,
	`old_values` text,
	`new_values` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `class_subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`coefficient` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cs_class_subject` ON `class_subjects` (`class_id`,`subject_id`);--> statement-breakpoint
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
CREATE TABLE `closed_periods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`closed_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cp_month_year` ON `closed_periods` (`month`,`year`);--> statement-breakpoint
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
CREATE TABLE `evaluations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`class_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`trimester` integer NOT NULL,
	`academic_year_id` integer NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `eval_unique_period` ON `evaluations` (`class_id`,`subject_id`,`trimester`,`type`);--> statement-breakpoint
CREATE TABLE `exams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`academic_year_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`teacher_id` integer,
	`trimester` integer NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`room` text DEFAULT '',
	`status` text DEFAULT 'draft',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`category_custom` text,
	`date` text NOT NULL,
	`notes` text,
	`academic_year_id` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `family_infos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`father_name` text,
	`father_phone` text,
	`father_profession` text,
	`mother_name` text,
	`mother_phone` text,
	`mother_profession` text,
	`guardian_name` text,
	`guardian_relation` text,
	`guardian_phone` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `family_infos_student_id_unique` ON `family_infos` (`student_id`);--> statement-breakpoint
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
CREATE TABLE `grades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`evaluation_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`score` real NOT NULL,
	`remarks` text,
	`is_absent` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grade_eval_student` ON `grades` (`evaluation_id`,`student_id`);--> statement-breakpoint
CREATE TABLE `medical_infos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`blood_type` text,
	`allergies` text,
	`medical_conditions` text,
	`medications` text,
	`doctor_name` text,
	`doctor_phone` text,
	`emergency_contact` text,
	`emergency_phone` text,
	`vaccination_status` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `medical_infos_student_id_unique` ON `medical_infos` (`student_id`);--> statement-breakpoint
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
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`academic_year_id` integer NOT NULL,
	`day` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`subject_id` integer,
	`teacher_id` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
	`discount_type` text,
	`discount_value` real,
	`discount_reason` text,
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
CREATE UNIQUE INDEX `teachers_email_unique` ON `teachers` (`email`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`theme` text DEFAULT 'light' NOT NULL,
	`primary_color` text DEFAULT '#dc2626' NOT NULL,
	`secondary_color` text DEFAULT '#3b82f6' NOT NULL,
	`accent_color` text DEFAULT '#10b981' NOT NULL,
	`sidebar_color` text DEFAULT '#374151' NOT NULL,
	`sidebar_text_color` text DEFAULT '#ffffff' NOT NULL,
	`border_radius` text DEFAULT 'medium' NOT NULL,
	`font_size` text DEFAULT 'medium' NOT NULL,
	`font_family` text DEFAULT 'Inter, sans-serif' NOT NULL,
	`dense_mode` integer DEFAULT false NOT NULL,
	`compact_sidebar` integer DEFAULT false NOT NULL,
	`animations` integer DEFAULT true NOT NULL,
	`high_contrast` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);