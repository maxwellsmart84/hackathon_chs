import { z } from 'zod';

// Enum definitions for better type safety
export const DevelopmentStageEnum = z.enum(
  ['Idea', 'Prototype', 'Pre-Clinical', 'FDA Submission', 'Post-Market'],
  {
    required_error: 'Please select your current development stage',
  }
);

export const RegulatoryStatusEnum = z.enum([
  'None',
  'Pre-IDE',
  'IDE Filed',
  'FDA Submission',
  '510(k)',
  'De Novo',
  'PMA',
  'Post-Market',
]);

export const NIHFundingInterestEnum = z.enum(['Yes', 'No', 'Interested']);

// Option arrays with proper typing
export const FOCUS_AREA_OPTIONS = [
  'Cardiology',
  'Oncology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Other',
] as const;

export const PRODUCT_TYPE_OPTIONS = [
  'Diagnostic',
  'Therapeutic',
  'Device',
  'Software',
  'Digital Therapeutic',
  'Other',
] as const;

export const TECHNOLOGY_OPTIONS = [
  'AI/ML',
  'Imaging',
  'Genomics',
  'Sensors',
  'Robotics',
  'Mobile App',
  'Other',
] as const;

export const BUSINESS_NEEDS_OPTIONS = [
  'Reimbursement Strategy',
  'IP & Licensing',
  'Academic Collaboration',
  'Tech Transfer',
  'Commercialization Support',
] as const;

// Validation schemas for array fields
const FocusAreaSchema = z.enum(FOCUS_AREA_OPTIONS);
const ProductTypeSchema = z.enum(PRODUCT_TYPE_OPTIONS);
const TechnologySchema = z.enum(TECHNOLOGY_OPTIONS);
const BusinessNeedSchema = z.enum(BUSINESS_NEEDS_OPTIONS);

// Main startup onboarding schema - clean version without type conflicts
export const StartupOnboardingSchema = z.object({
  // Company Overview Section
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters')
    .trim(),

  description: z
    .string()
    .min(30, 'Description must be at least 30 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),

  stage: DevelopmentStageEnum,

  // Focus Areas & Technology Section
  focusAreas: z
    .array(FocusAreaSchema)
    .min(1, 'Please select at least one focus area')
    .max(3, 'Please select no more than 3 focus areas'),

  productTypes: z
    .array(ProductTypeSchema)
    .min(1, 'Please select at least one product type')
    .max(3, 'Please select no more than 3 product types'),

  technologies: z
    .array(TechnologySchema)
    .min(1, 'Please select at least one technology')
    .max(5, 'Please select no more than 5 technologies'),

  // Regulatory & Clinical Section
  regulatoryStatus: RegulatoryStatusEnum.optional(),

  needsClinicalTrials: z.boolean(),

  nihFundingInterest: NIHFundingInterestEnum.optional(),

  // Business Support Section - using default instead of optional
  businessNeeds: z
    .array(BusinessNeedSchema)
    .max(5, 'Please select no more than 5 business needs')
    .default([]),

  // Keywords/Tags Section - using default instead of optional
  keywords: z
    .array(
      z
        .string()
        .min(2, 'Keywords must be at least 2 characters')
        .max(50, 'Keywords must be less than 50 characters')
        .trim()
    )
    .max(10, 'Maximum 10 keywords allowed')
    .default([]),
});

// Inferred types
export type StartupOnboardingFormData = z.infer<typeof StartupOnboardingSchema>;
export type DevelopmentStage = z.infer<typeof DevelopmentStageEnum>;
export type RegulatoryStatus = z.infer<typeof RegulatoryStatusEnum>;
export type NIHFundingInterest = z.infer<typeof NIHFundingInterestEnum>;
export type FocusArea = (typeof FOCUS_AREA_OPTIONS)[number];
export type ProductType = (typeof PRODUCT_TYPE_OPTIONS)[number];
export type Technology = (typeof TECHNOLOGY_OPTIONS)[number];
export type BusinessNeed = (typeof BUSINESS_NEEDS_OPTIONS)[number];
