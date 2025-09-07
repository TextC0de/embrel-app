DROP TABLE IF EXISTS `passengers`;
--> statement-breakpoint
DROP TABLE IF EXISTS `sessions`;
--> statement-breakpoint
DROP TABLE IF EXISTS `settings`;
--> statement-breakpoint
DROP TABLE IF EXISTS `user_flights`;
--> statement-breakpoint
CREATE TABLE `passengers` (
	`id` text PRIMARY KEY NOT NULL,
	`passenger` text NOT NULL,
	`pnr` text NOT NULL,
	`route` text NOT NULL,
	`flight` text NOT NULL,
	`seat` text NOT NULL,
	`seq` text NOT NULL,
	`timestamp` integer NOT NULL,
	`raw_data` text NOT NULL,
	`session_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`flight_number` text NOT NULL,
	`flight_route` text NOT NULL,
	`flight_date` text NOT NULL,
	`flight_time` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`total_passengers` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY DEFAULT 'main' NOT NULL,
	`sound_enabled` integer DEFAULT true,
	`vibration_enabled` integer DEFAULT true,
	`auto_scan_enabled` integer DEFAULT false,
	`theme` text DEFAULT 'light',
	`last_backup_date` integer,
	`keep_screen_on` integer DEFAULT true,
	`auto_backup` integer DEFAULT false,
	`debug_mode` integer DEFAULT false,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_flights` (
	`id` text PRIMARY KEY NOT NULL,
	`flight_number` text NOT NULL,
	`route` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
