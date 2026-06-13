CREATE TABLE `class_fee_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`fee_type_id` integer NOT NULL,
	`amount` real,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cft_class_fee_type` ON `class_fee_types` (`class_id`,`fee_type_id`);