ALTER TABLE `quotes` ADD `businessType` varchar(50);--> statement-breakpoint
ALTER TABLE `quotes` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `quotes` ADD `hasCRM` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `quotes` ADD `crmSystem` varchar(255);--> statement-breakpoint
ALTER TABLE `quotes` ADD `crmOther` varchar(255);--> statement-breakpoint
ALTER TABLE `quotes` ADD `hasERP` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `quotes` ADD `erpSystem` varchar(255);--> statement-breakpoint
ALTER TABLE `quotes` ADD `erpOther` varchar(255);