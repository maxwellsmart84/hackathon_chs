import { sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlTable,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

// User types enum
export const userTypes = ["startup", "stakeholder", "admin"] as const;
export type UserType = typeof userTypes[number];

// Users table (base for all user types)
export const users = mysqlTable("chs_hack_users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(),
  profileComplete: boolean("profile_complete").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  clerkIdIdx: index("clerk_id_idx").on(table.clerkId),
  userTypeIdx: index("user_type_idx").on(table.userType),
}));

// Startup profiles
export const startups = mysqlTable("chs_hack_startups", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  description: text("description"),
  website: varchar("website", { length: 500 }),
  focusArea: varchar("focus_area", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(), // idea, prototype, mvp, scaling, etc.
  currentGoals: json("current_goals").$type<string[]>(),
  currentNeeds: json("current_needs").$type<string[]>(),
  milestones: json("milestones").$type<{ title: string; completed: boolean; date?: string }[]>(),
  fundingStatus: varchar("funding_status", { length: 100 }),
  teamSize: int("team_size"),
  location: varchar("location", { length: 100 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  focusAreaIdx: index("focus_area_idx").on(table.focusArea),
  stageIdx: index("stage_idx").on(table.stage),
}));

// Stakeholder profiles (MUSC internal)
export const stakeholders = mysqlTable("chs_hack_stakeholders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  department: varchar("department", { length: 200 }).notNull(),
  specialties: json("specialties").$type<string[]>(),
  expertiseAreas: json("expertise_areas").$type<string[]>(),
  availableResources: json("available_resources").$type<string[]>(),
  collaborationInterests: json("collaboration_interests").$type<string[]>(),
  researchInterests: text("research_interests"),
  availabilityStatus: varchar("availability_status", { length: 50 }).default("available"), // available, busy, unavailable
  mentorshipInterest: boolean("mentorship_interest").default(false),
  bio: text("bio"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  departmentIdx: index("department_idx").on(table.department),
  availabilityIdx: index("availability_idx").on(table.availabilityStatus),
}));

// Connection requests and matches
export const connections = mysqlTable("chs_hack_connections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  startupId: varchar("startup_id", { length: 255 }).notNull(),
  stakeholderId: varchar("stakeholder_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, accepted, declined, completed
  initiatedBy: varchar("initiated_by", { length: 255 }).notNull(), // user ID who initiated
  message: text("message"),
  response: text("response"),
  aiMatchScore: int("ai_match_score"), // 0-100 score from AI matching
  matchReasons: json("match_reasons").$type<string[]>(),
  meetingScheduled: boolean("meeting_scheduled").default(false),
  followUpCompleted: boolean("follow_up_completed").default(false),
  connectionOutcome: varchar("connection_outcome", { length: 100 }),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  startupIdIdx: index("startup_id_idx").on(table.startupId),
  stakeholderIdIdx: index("stakeholder_id_idx").on(table.stakeholderId),
  statusIdx: index("status_idx").on(table.status),
  aiMatchScoreIdx: index("ai_match_score_idx").on(table.aiMatchScore),
}));

// Analytics and insights
export const analytics = mysqlTable("chs_hack_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  date: datetime("date").notNull(),
  metric: varchar("metric", { length: 100 }).notNull(),
  value: varchar("value", { length: 500 }).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  dateIdx: index("date_idx").on(table.date),
  metricIdx: index("metric_idx").on(table.metric),
}));

// Resource tags for categorization
export const resourceTags = mysqlTable("chs_hack_resource_tags", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(), // expertise, resource, specialty, etc.
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3b82f6"), // hex color for UI
  usageCount: int("usage_count").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
  nameIdx: index("name_idx").on(table.name),
})); 