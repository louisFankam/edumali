CREATE TABLE `school_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'event' NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`start_time` text,
	`end_time` text,
	`all_day` integer DEFAULT true NOT NULL,
	`color` text,
	`created_at` integer,
	`updated_at` integer
);
