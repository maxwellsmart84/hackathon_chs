CREATE TABLE `chs_hack_analytics` (
	`id` varchar(255) NOT NULL,
	`date` datetime NOT NULL,
	`metric` varchar(100) NOT NULL,
	`value` varchar(500) NOT NULL,
	`metadata` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chs_hack_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chs_hack_connections` (
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
	CONSTRAINT `chs_hack_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chs_hack_resource_tags` (
	`id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(50) NOT NULL,
	`description` text,
	`color` varchar(7) DEFAULT '#3b82f6',
	`usage_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chs_hack_resource_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `chs_hack_resource_tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `chs_hack_stakeholders` (
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
	CONSTRAINT `chs_hack_stakeholders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chs_hack_startups` (
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
	CONSTRAINT `chs_hack_startups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chs_hack_users` (
	`id` varchar(255) NOT NULL,
	`clerk_id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`user_type` varchar(20) NOT NULL,
	`profile_complete` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chs_hack_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `chs_hack_users_clerk_id_unique` UNIQUE(`clerk_id`)
);
--> statement-breakpoint
DROP TABLE `analytics`;--> statement-breakpoint
DROP TABLE `connections`;--> statement-breakpoint
DROP TABLE `resource_tags`;--> statement-breakpoint
DROP TABLE `stakeholders`;--> statement-breakpoint
DROP TABLE `startups`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
CREATE INDEX `date_idx` ON `chs_hack_analytics` (`date`);--> statement-breakpoint
CREATE INDEX `metric_idx` ON `chs_hack_analytics` (`metric`);--> statement-breakpoint
CREATE INDEX `startup_id_idx` ON `chs_hack_connections` (`startup_id`);--> statement-breakpoint
CREATE INDEX `stakeholder_id_idx` ON `chs_hack_connections` (`stakeholder_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `chs_hack_connections` (`status`);--> statement-breakpoint
CREATE INDEX `ai_match_score_idx` ON `chs_hack_connections` (`ai_match_score`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `chs_hack_resource_tags` (`category`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `chs_hack_resource_tags` (`name`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `chs_hack_stakeholders` (`user_id`);--> statement-breakpoint
CREATE INDEX `department_idx` ON `chs_hack_stakeholders` (`department`);--> statement-breakpoint
CREATE INDEX `availability_idx` ON `chs_hack_stakeholders` (`availability_status`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `chs_hack_startups` (`user_id`);--> statement-breakpoint
CREATE INDEX `focus_area_idx` ON `chs_hack_startups` (`focus_area`);--> statement-breakpoint
CREATE INDEX `stage_idx` ON `chs_hack_startups` (`stage`);--> statement-breakpoint
CREATE INDEX `clerk_id_idx` ON `chs_hack_users` (`clerk_id`);--> statement-breakpoint
CREATE INDEX `user_type_idx` ON `chs_hack_users` (`user_type`);