PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_class_subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`coefficient` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_class_subjects`("id", "class_id", "subject_id", "coefficient") SELECT "id", "class_id", "subject_id", "coefficient" FROM `class_subjects`;--> statement-breakpoint
DROP TABLE `class_subjects`;--> statement-breakpoint
ALTER TABLE `__new_class_subjects` RENAME TO `class_subjects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `cs_class_subject` ON `class_subjects` (`class_id`,`subject_id`);--> statement-breakpoint
ALTER TABLE `students` ADD `discount_type` text;--> statement-breakpoint
ALTER TABLE `students` ADD `discount_value` real;--> statement-breakpoint
ALTER TABLE `students` ADD `discount_reason` text;