ALTER TABLE `quotes` ADD `status` enum('pending','won','lost') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `quotes` ADD `closedAt` timestamp;--> statement-breakpoint
ALTER TABLE `quotes` ADD `closureNotes` text;