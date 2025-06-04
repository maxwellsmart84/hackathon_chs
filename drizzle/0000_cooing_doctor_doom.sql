CREATE TABLE `analytics` (
	`id` varchar(255) NOT NULL,
	`date` datetime NOT NULL,
	`metric` varchar(100) NOT NULL,
	`value` varchar(500) NOT NULL,
	`metadata` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`id` varchar(255) NOT NULL,
	`startup_id` varchar(255) NOT NULL,
	`stakeholder_id` varchar(255) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`initiated_by` varchar(255) NOT NULL,
	`message` text,
	`response` text,
	`ai_match_score` int,
	`match_reasons` json,
	`meeting_scheduled` boolean DEFAULT false,
	`follow_up_completed` boolean DEFAULT false,
	`connection_outcome` varchar(100),
	`feedback` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_tags` (
	`id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(50) NOT NULL,
	`description` text,
	`color` varchar(7) DEFAULT '#3b82f6',
	`usage_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `resource_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `resource_tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `stakeholders` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`title` varchar(200) NOT NULL,
	`department` varchar(200) NOT NULL,
	`specialties` json,
	`expertise_areas` json,
	`available_resources` json,
	`collaboration_interests` json,
	`research_interests` text,
	`availability_status` varchar(50) DEFAULT 'available',
	`mentorship_interest` boolean DEFAULT false,
	`bio` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stakeholders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `startups` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`company_name` varchar(200) NOT NULL,
	`description` text,
	`website` varchar(500),
	`focus_area` varchar(100) NOT NULL,
	`stage` varchar(50) NOT NULL,
	`current_goals` json,
	`current_needs` json,
	`milestones` json,
	`funding_status` varchar(100),
	`team_size` int,
	`location` varchar(100),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `startups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`clerk_id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`user_type` varchar(20) NOT NULL,
	`profile_complete` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_clerk_id_unique` UNIQUE(`clerk_id`)
);
--> statement-breakpoint
CREATE INDEX `date_idx` ON `analytics` (`date`);--> statement-breakpoint
CREATE INDEX `metric_idx` ON `analytics` (`metric`);--> statement-breakpoint
CREATE INDEX `startup_id_idx` ON `connections` (`startup_id`);--> statement-breakpoint
CREATE INDEX `stakeholder_id_idx` ON `connections` (`stakeholder_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `connections` (`status`);--> statement-breakpoint
CREATE INDEX `ai_match_score_idx` ON `connections` (`ai_match_score`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `resource_tags` (`category`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `resource_tags` (`name`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `stakeholders` (`user_id`);--> statement-breakpoint
CREATE INDEX `department_idx` ON `stakeholders` (`department`);--> statement-breakpoint
CREATE INDEX `availability_idx` ON `stakeholders` (`availability_status`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `startups` (`user_id`);--> statement-breakpoint
CREATE INDEX `focus_area_idx` ON `startups` (`focus_area`);--> statement-breakpoint
CREATE INDEX `stage_idx` ON `startups` (`stage`);--> statement-breakpoint
CREATE INDEX `clerk_id_idx` ON `users` (`clerk_id`);--> statement-breakpoint
CREATE INDEX `user_type_idx` ON `users` (`user_type`);