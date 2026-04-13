CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`expires_at` integer,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `bpjs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kode_bpjs` text NOT NULL,
	`tindakan_id` integer,
	`diagnosa_id` integer,
	`tariff` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`tindakan_id`) REFERENCES `tindakan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`diagnosa_id`) REFERENCES `diagnosa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `diagnosa` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kode_cdi` text NOT NULL,
	`name` text NOT NULL,
	`penjelasan` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `icd10` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name_id` text NOT NULL,
	`name_en` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `icd9` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name_id` text NOT NULL,
	`name_en` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity` text NOT NULL,
	`last_sync` integer NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tariffs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`class` text,
	`tariff` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `tindakan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kode_cdi` text NOT NULL,
	`name` text NOT NULL,
	`penjelasan` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_unique` ON `api_keys` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `bpjs_kode_bpjs_unique` ON `bpjs` (`kode_bpjs`);--> statement-breakpoint
CREATE UNIQUE INDEX `diagnosa_kode_cdi_unique` ON `diagnosa` (`kode_cdi`);--> statement-breakpoint
CREATE UNIQUE INDEX `icd10_code_unique` ON `icd10` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `icd9_code_unique` ON `icd9` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `tariffs_code_unique` ON `tariffs` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `tindakan_kode_cdi_unique` ON `tindakan` (`kode_cdi`);