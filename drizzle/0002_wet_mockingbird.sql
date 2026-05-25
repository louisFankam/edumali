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
CREATE TABLE `closed_periods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`closed_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cp_month_year` ON `closed_periods` (`month`,`year`);--> statement-breakpoint
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
CREATE UNIQUE INDEX `medical_infos_student_id_unique` ON `medical_infos` (`student_id`);