import { z } from 'zod';

// Define the enums
const StageEnum = z.enum(['Idea', 'Prototype', 'Pre-Clinical', 'FDA Submission', 'Post-Market']);
const RegulatoryStatusEnum = z.enum([
  'None',
  'Pre-IDE',
  'IDE Filed',
  'FDA Submission',
  '510(k)',
  'De Novo',
  'PMA',
  'Post-Market',
]);
const NIHFundingInterestEnum = z.enum(['Yes', 'No', 'Interested']);

// Schema for creating a new startup profile
export const createStartupSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  companyName: z.string().min(1, 'Company name is required').max(200),
  description: z.string().min(30, 'Description must be at least 30 characters').max(1000),
  stage: StageEnum,
  focusAreas: z.array(z.string()).min(1, 'At least one focus area is required'),
  productTypes: z.array(z.string()).min(1, 'At least one product type is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  regulatoryStatus: RegulatoryStatusEnum.optional(),
  needsClinicalTrials: z.boolean().default(false),
  nihFundingInterest: NIHFundingInterestEnum.optional(),
  businessNeeds: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  website: z.string().url().optional(),
  currentGoals: z.array(z.string()).optional(),
  currentNeeds: z.array(z.string()).optional(),
  milestones: z
    .array(
      z.object({
        title: z.string(),
        completed: z.boolean(),
        date: z.string().optional(),
      })
    )
    .optional(),
  fundingStatus: z.string().optional(),
  teamSize: z.number().int().positive().optional(),
  location: z.string().optional(),
});

// Schema for the form data (includes user fields that don't go to startup table)
export const startupOnboardingFormSchema = z.object({
  // User fields (for updating user table)
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  // Startup fields (for creating startup record)
  ...createStartupSchema.shape,
});

// Type for creating a new startup profile
export type CreateStartup = z.infer<typeof createStartupSchema>;

// Type for the complete form data
export type StartupOnboardingFormData = z.infer<typeof startupOnboardingFormSchema>;

// Schema for updating a startup profile (all fields optional except userId)
export const updateStartupSchema = createStartupSchema.partial().extend({
  userId: z.string(),
});

// Type for updating a startup profile
export type UpdateStartup = z.infer<typeof updateStartupSchema>;

// Export the enums for use in other files
export { StageEnum, RegulatoryStatusEnum, NIHFundingInterestEnum };
