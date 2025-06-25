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

// Stakeholder types enum
export const StakeholderTypeSchema = z.enum([
  'cro',
  'financier',
  'consultant',
  'advisor',
  'investor',
  'service_provider',
  'musc_faculty', // Keep existing MUSC stakeholders
  'other',
]);

// Services offered by external stakeholders
export const ServiceTypeSchema = z.enum([
  'clinical-trials',
  'regulatory-consulting',
  'funding',
  'business-development',
  'market-research',
  'intellectual-property',
  'manufacturing',
  'quality-assurance',
  'software-development',
  'data-analysis',
  'marketing',
  'sales',
  'legal-services',
  'accounting',
  'strategic-planning',
  'mentorship',
  'other',
]);

// Therapeutic areas for external stakeholders
export const TherapeuticAreaSchema = z.enum([
  'cardiology',
  'oncology',
  'neurology',
  'orthopedics',
  'dermatology',
  'ophthalmology',
  'endocrinology',
  'gastroenterology',
  'infectious-disease',
  'respiratory',
  'mental-health',
  'pediatrics',
  'geriatrics',
  'women-health',
  'rare-diseases',
  'other',
]);

// Industries served by external stakeholders
export const IndustrySchema = z.enum([
  'medical-devices',
  'pharmaceuticals',
  'biotechnology',
  'digital-health',
  'diagnostics',
  'surgical-instruments',
  'healthcare-it',
  'telemedicine',
  'ai-ml-healthcare',
  'wearables',
  'other',
]);

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

// Base stakeholder profile schema without refinements
export const BaseStakeholderProfileSchema = z.object({
  // Common fields
  stakeholderType: StakeholderTypeSchema,
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),

  // External stakeholder fields
  organizationName: z.string().min(1, 'Organization name is required').optional(),
  contactEmail: z.string().email('Please enter a valid email').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  servicesOffered: z.array(ServiceTypeSchema).optional(),
  therapeuticAreas: z.array(TherapeuticAreaSchema).optional(),
  industries: z.array(IndustrySchema).optional(),
  capabilities: z.string().max(1000, 'Capabilities must be 1000 characters or less').optional(),

  // MUSC stakeholder fields (for backward compatibility)
  title: z.string().optional(),
  department: DepartmentSchema.optional(),
  specialties: z.array(z.string()).optional(),
  expertiseAreas: z.array(ExpertiseAreaSchema).optional(),
  availableResources: z.array(ResourceTypeSchema).optional(),
  collaborationInterests: z.array(z.string()).optional(),
  researchInterests: z.string().optional(),
  availabilityStatus: AvailabilityStatusSchema.default('available'),
  mentorshipInterest: z.boolean().default(false),
});

// Updated stakeholder profile schema to support both external and MUSC stakeholders
export const StakeholderProfileSchema = BaseStakeholderProfileSchema.refine(
  data => {
    // Require organization name for external stakeholders
    if (
      [
        'cro',
        'financier',
        'consultant',
        'advisor',
        'investor',
        'service_provider',
        'other',
      ].includes(data.stakeholderType)
    ) {
      return data.organizationName && data.organizationName.length > 0;
    }
    // Require title and department for MUSC faculty
    if (data.stakeholderType === 'musc_faculty') {
      return data.title && data.title.length > 0 && data.department;
    }
    return true;
  },
  {
    message: 'Please complete required fields for your stakeholder type',
    path: ['organizationName'],
  }
);

// Partial schema for updates
export const PartialStakeholderProfileSchema = BaseStakeholderProfileSchema.partial();

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
export type StakeholderType = z.infer<typeof StakeholderTypeSchema>;
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export type TherapeuticArea = z.infer<typeof TherapeuticAreaSchema>;
export type Industry = z.infer<typeof IndustrySchema>;
