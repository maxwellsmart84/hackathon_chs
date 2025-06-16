import { z } from 'zod';

// User type enum
export const UserTypeSchema = z.enum(['startup', 'stakeholder', 'admin']);
export type UserType = z.infer<typeof UserTypeSchema>;

// Base user schema
export const UserSchema = z.object({
  id: z.string(),
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  userType: UserTypeSchema,
  profileComplete: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Startup-specific enums and schemas
export const StartupStageSchema = z.enum([
  'idea',
  'prototype',
  'mvp',
  'early-revenue',
  'scaling',
  'growth',
]);

export const FocusAreaSchema = z.enum([
  'medical-devices',
  'digital-health',
  'biotechnology',
  'pharmaceuticals',
  'ai-ml',
  'telemedicine',
  'diagnostics',
  'therapeutics',
  'surgical-innovation',
  'patient-care',
  'other',
]);

export const FundingStatusSchema = z.enum([
  'pre-seed',
  'seed',
  'series-a',
  'series-b',
  'series-c-plus',
  'grant-funded',
  'bootstrapped',
  'seeking-funding',
]);

// Milestone schema
export const MilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required'),
  completed: z.boolean(),
  date: z.string().optional(),
});

// Startup profile schema
export const StartupProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  description: z
    .string()
    .min(10, 'Please provide a meaningful description (at least 10 characters)'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  focusAreas: z.array(FocusAreaSchema).min(1, 'Please select at least one focus area'),
  stage: StartupStageSchema,
  currentGoals: z.array(z.string()).min(1, 'Please specify at least one current goal'),
  currentNeeds: z.array(z.string()).min(1, 'Please specify at least one current need'),
  milestones: z.array(MilestoneSchema).optional(),
  fundingStatus: FundingStatusSchema.optional(),
  teamSize: z.number().int().positive().optional(),
  location: z.string().optional(),
});

// MUSC departments
export const DepartmentSchema = z.enum([
  'anesthesia',
  'cardiology',
  'dermatology',
  'emergency-medicine',
  'family-medicine',
  'internal-medicine',
  'neurology',
  'oncology',
  'orthopedics',
  'pediatrics',
  'psychiatry',
  'radiology',
  'surgery',
  'urology',
  'nursing',
  'pharmacy',
  'public-health',
  'biomedical-informatics',
  'bioengineering',
  'research-administration',
  'technology-transfer',
  'innovation-center',
  'other',
]);

// Expertise areas
export const ExpertiseAreaSchema = z.enum([
  'clinical-trials',
  'regulatory-affairs',
  'intellectual-property',
  'medical-device-development',
  'software-development',
  'data-analysis',
  'biostatistics',
  'grant-writing',
  'commercialization',
  'market-research',
  'user-experience',
  'quality-assurance',
  'compliance',
  'project-management',
  'strategic-planning',
  'fundraising',
  'networking',
  'mentorship',
  'other',
]);

// Available resources
export const ResourceTypeSchema = z.enum([
  'laboratory-space',
  'clinical-data',
  'patient-populations',
  'research-equipment',
  'computational-resources',
  'funding-opportunities',
  'regulatory-guidance',
  'legal-support',
  'marketing-support',
  'business-development',
  'technical-expertise',
  'clinical-expertise',
  'administrative-support',
  'networking-opportunities',
  'educational-resources',
  'other',
]);

// Availability status
export const AvailabilityStatusSchema = z.enum(['available', 'busy', 'unavailable']);

// Stakeholder profile schema
export const StakeholderProfileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: DepartmentSchema,
  specialties: z.array(z.string()).optional(),
  expertiseAreas: z
    .array(ExpertiseAreaSchema)
    .min(1, 'Please specify at least one area of expertise'),
  availableResources: z.array(ResourceTypeSchema).optional(),
  collaborationInterests: z.array(z.string()).optional(),
  researchInterests: z.string().optional(),
  availabilityStatus: AvailabilityStatusSchema.default('available'),
  mentorshipInterest: z.boolean().default(false),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

// Connection status
export const ConnectionStatusSchema = z.enum(['pending', 'accepted', 'declined', 'completed']);

// Connection request schema
export const ConnectionRequestSchema = z.object({
  startupId: z.string(),
  stakeholderId: z.string(),
  message: z.string().min(10, 'Please provide a meaningful message (at least 10 characters)'),
});

// Connection response schema
export const ConnectionResponseSchema = z.object({
  connectionId: z.string(),
  status: ConnectionStatusSchema,
  response: z.string().optional(),
});

// Search and filter schemas
export const StartupSearchSchema = z.object({
  query: z.string().optional(),
  focusArea: FocusAreaSchema.optional(),
  stage: StartupStageSchema.optional(),
  fundingStatus: FundingStatusSchema.optional(),
  location: z.string().optional(),
});

export const StakeholderSearchSchema = z.object({
  query: z.string().optional(),
  department: DepartmentSchema.optional(),
  expertiseArea: ExpertiseAreaSchema.optional(),
  availabilityStatus: AvailabilityStatusSchema.optional(),
  mentorshipInterest: z.boolean().optional(),
});

// Admin analytics schemas
export const AnalyticsMetricSchema = z.enum([
  'total-connections',
  'successful-connections',
  'pending-connections',
  'startup-registrations',
  'stakeholder-registrations',
  'top-focus-areas',
  'top-expertise-areas',
  'connection-success-rate',
  'average-response-time',
]);

export const AnalyticsRequestSchema = z.object({
  metric: AnalyticsMetricSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

// Export inferred types
export type StartupProfile = z.infer<typeof StartupProfileSchema>;
export type StakeholderProfile = z.infer<typeof StakeholderProfileSchema>;
export type ConnectionRequest = z.infer<typeof ConnectionRequestSchema>;
export type ConnectionResponse = z.infer<typeof ConnectionResponseSchema>;
export type StartupSearch = z.infer<typeof StartupSearchSchema>;
export type StakeholderSearch = z.infer<typeof StakeholderSearchSchema>;
export type FocusArea = z.infer<typeof FocusAreaSchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type ExpertiseArea = z.infer<typeof ExpertiseAreaSchema>;
export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type StartupStage = z.infer<typeof StartupStageSchema>;
export type FundingStatus = z.infer<typeof FundingStatusSchema>;
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
