CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` enum('link_copied','pdf_exported') NOT NULL,
	`product` varchar(20) NOT NULL,
	`imobPlan` varchar(20),
	`locPlan` varchar(20),
	`frequency` varchar(20) NOT NULL,
	`addons` text NOT NULL,
	`metrics` text NOT NULL,
	`totals` text NOT NULL,
	`komboId` varchar(50),
	`komboName` varchar(100),
	`komboDiscount` int,
	`shareableUrl` text,
	`clientName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
