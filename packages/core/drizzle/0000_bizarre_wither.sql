CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`type` text NOT NULL,
	`handle` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `channels_contact_idx` ON `channels` (`contact_id`);--> statement-breakpoint
CREATE INDEX `channels_handle_idx` ON `channels` (`type`,`handle`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`description` text,
	`notes` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`full_name` text NOT NULL,
	`role` text,
	`notes` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `contacts_company_idx` ON `contacts` (`company_id`);--> statement-breakpoint
CREATE INDEX `contacts_name_idx` ON `contacts` (`full_name`);--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`channel_type` text NOT NULL,
	`direction` text NOT NULL,
	`subject` text,
	`body` text,
	`occurred_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`metadata` text,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `interactions_contact_idx` ON `interactions` (`contact_id`);--> statement-breakpoint
CREATE INDEX `interactions_list_contact_idx` ON `interactions` (`list_id`,`contact_id`);--> statement-breakpoint
CREATE INDEX `interactions_occurred_idx` ON `interactions` (`occurred_at`);--> statement-breakpoint
CREATE TABLE `list_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`status` text DEFAULT 'not_contacted' NOT NULL,
	`priority` text,
	`assigned_to` text,
	`added_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`status_changed_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `list_memberships_uniq` ON `list_memberships` (`list_id`,`contact_id`);--> statement-breakpoint
CREATE INDEX `list_memberships_list_idx` ON `list_memberships` (`list_id`);--> statement-breakpoint
CREATE INDEX `list_memberships_status_idx` ON `list_memberships` (`list_id`,`status`);--> statement-breakpoint
CREATE TABLE `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`goal` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
