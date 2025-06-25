'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Building2, Users, Briefcase, Target, User } from 'lucide-react';
import { z } from 'zod';
import PageHeader from '@/components/layout/PageHeader';

// Define the enum types locally to avoid import issues
const stakeholderTypeEnum = z.enum([
  'cro',
  'financier',
  'consultant',
  'advisor',
  'investor',
  'service_provider',
  'musc_faculty',
  'other',
]);

const serviceTypeEnum = z.enum([
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

const therapeuticAreaEnum = z.enum([
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

const industryEnum = z.enum([
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

// Form schema that includes user fields
const StakeholderOnboardingFormSchema = z.object({
  // User fields
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  userId: z.string(),
  // Stakeholder profile fields
  stakeholderType: stakeholderTypeEnum,
  organizationName: z.string().min(1, 'Organization name is required'),
  contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  servicesOffered: z.array(serviceTypeEnum).optional(),
  therapeuticAreas: z.array(therapeuticAreaEnum).optional(),
  industries: z.array(industryEnum).optional(),
  capabilities: z.string().max(1000, 'Capabilities must be 1000 characters or less').optional(),
});

export type StakeholderOnboardingFormData = z.infer<typeof StakeholderOnboardingFormSchema>;

// Option arrays for form fields
export const STAKEHOLDER_TYPE_OPTIONS = [
  { value: 'cro', label: 'Contract Research Organization (CRO)' },
  { value: 'investor', label: 'Investor' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'financier', label: 'Financier' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'other', label: 'Other' },
] as const;

export const SERVICE_TYPE_OPTIONS = [
  { value: 'clinical-trials', label: 'Clinical Trials' },
  { value: 'regulatory-consulting', label: 'Regulatory Consulting' },
  { value: 'funding', label: 'Funding' },
  { value: 'business-development', label: 'Business Development' },
  { value: 'market-research', label: 'Market Research' },
  { value: 'intellectual-property', label: 'Intellectual Property' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'quality-assurance', label: 'Quality Assurance' },
  { value: 'software-development', label: 'Software Development' },
  { value: 'data-analysis', label: 'Data Analysis' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'legal-services', label: 'Legal Services' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'strategic-planning', label: 'Strategic Planning' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'other', label: 'Other' },
] as const;

export const THERAPEUTIC_AREA_OPTIONS = [
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'infectious-disease', label: 'Infectious Disease' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'geriatrics', label: 'Geriatrics' },
  { value: 'women-health', label: "Women's Health" },
  { value: 'rare-diseases', label: 'Rare Diseases' },
  { value: 'other', label: 'Other' },
] as const;

export const INDUSTRY_OPTIONS = [
  { value: 'medical-devices', label: 'Medical Devices' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'biotechnology', label: 'Biotechnology' },
  { value: 'digital-health', label: 'Digital Health' },
  { value: 'diagnostics', label: 'Diagnostics' },
  { value: 'surgical-instruments', label: 'Surgical Instruments' },
  { value: 'healthcare-it', label: 'Healthcare IT' },
  { value: 'telemedicine', label: 'Telemedicine' },
  { value: 'ai-ml-healthcare', label: 'AI/ML Healthcare' },
  { value: 'wearables', label: 'Wearables' },
  { value: 'other', label: 'Other' },
] as const;

interface StakeholderOnboardingFormProps {
  onSubmit: (data: StakeholderOnboardingFormData) => void;
  isSubmitting?: boolean;
  initialUserData?: {
    firstName?: string;
    lastName?: string;
    userId: string;
  };
  initialStakeholderData?: Partial<StakeholderOnboardingFormData>;
  mode?: 'create' | 'edit';
}

export default function StakeholderOnboardingForm({
  onSubmit,
  isSubmitting,
  initialUserData,
  initialStakeholderData,
  mode = 'create',
}: StakeholderOnboardingFormProps) {
  const form = useForm<StakeholderOnboardingFormData>({
    resolver: zodResolver(StakeholderOnboardingFormSchema),
    defaultValues: {
      userId: '',
      firstName: '',
      lastName: '',
      stakeholderType: 'other',
      organizationName: '',
      contactEmail: '',
      website: '',
      location: '',
      bio: '',
      servicesOffered: [],
      therapeuticAreas: [],
      industries: [],
      capabilities: '',
    },
    mode: 'onChange',
  });

  // Pre-populate user data when available
  useEffect(() => {
    if (initialUserData) {
      form.setValue('userId', initialUserData.userId);
      if (initialUserData.firstName) {
        form.setValue('firstName', initialUserData.firstName);
      }
      if (initialUserData.lastName) {
        form.setValue('lastName', initialUserData.lastName);
      }
      form.trigger(); // Trigger validation after setting values
    }
  }, [initialUserData, form]);

  // Pre-populate stakeholder data when editing
  useEffect(() => {
    if (initialStakeholderData) {
      Object.entries(initialStakeholderData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.setValue(key as keyof StakeholderOnboardingFormData, value);
        }
      });
    }
  }, [initialStakeholderData, form]);

  const handleSubmit = (data: StakeholderOnboardingFormData) => {
    onSubmit(data);
  };

  // Toggle functions for arrays
  const toggleServiceOffered = (value: z.infer<typeof serviceTypeEnum>) => {
    const currentValues = form.getValues('servicesOffered') || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: z.infer<typeof serviceTypeEnum>) => v !== value)
      : [...currentValues, value];
    form.setValue('servicesOffered', newValues);
  };

  const toggleTherapeuticArea = (value: z.infer<typeof therapeuticAreaEnum>) => {
    const currentValues = form.getValues('therapeuticAreas') || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: z.infer<typeof therapeuticAreaEnum>) => v !== value)
      : [...currentValues, value];
    form.setValue('therapeuticAreas', newValues);
  };

  const toggleIndustry = (value: z.infer<typeof industryEnum>) => {
    const currentValues = form.getValues('industries') || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: z.infer<typeof industryEnum>) => v !== value)
      : [...currentValues, value];
    form.setValue('industries', newValues);
  };

  const toggleAllTherapeuticAreas = () => {
    const currentValues = form.getValues('therapeuticAreas') || [];
    const allValues = THERAPEUTIC_AREA_OPTIONS.map(option => option.value);

    // If all are selected, deselect all. Otherwise, select all.
    const newValues = currentValues.length === allValues.length ? [] : allValues;
    form.setValue('therapeuticAreas', newValues);
  };

  const toggleAllIndustries = () => {
    const currentValues = form.getValues('industries') || [];
    const allValues = INDUSTRY_OPTIONS.map(option => option.value);

    // If all are selected, deselect all. Otherwise, select all.
    const newValues = currentValues.length === allValues.length ? [] : allValues;
    form.setValue('industries', newValues);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <PageHeader
        title={mode === 'edit' ? 'Edit Stakeholder Profile' : 'Stakeholder Onboarding'}
        description={
          mode === 'edit'
            ? 'Update your stakeholder profile information'
            : 'Complete your profile to connect with innovative MedTech startups'
        }
        icon={Users}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Section 1: Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-indigo-600" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your contact email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself and your professional background (optional)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 2: Organization Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Organization Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stakeholderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stakeholder Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your stakeholder type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAKEHOLDER_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourcompany.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State/Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Services & Expertise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                <span>Services & Expertise</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="servicesOffered"
                render={() => (
                  <FormItem>
                    <FormLabel>Services Offered</FormLabel>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {SERVICE_TYPE_OPTIONS.map(service => (
                        <div key={service.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service.value}`}
                            checked={(form.getValues('servicesOffered') || []).includes(
                              service.value
                            )}
                            onCheckedChange={() => toggleServiceOffered(service.value)}
                          />
                          <Label htmlFor={`service-${service.value}`} className="text-sm">
                            {service.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capabilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capabilities & Expertise</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your key capabilities, expertise, and what you can offer to startups"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 4: Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-red-600" />
                <span>Focus Areas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="therapeuticAreas"
                render={() => (
                  <FormItem>
                    <FormLabel>Therapeutic Areas</FormLabel>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      <div className="col-span-2 mb-2 md:col-span-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all-therapeutic"
                            checked={
                              (form.getValues('therapeuticAreas') || []).length ===
                              THERAPEUTIC_AREA_OPTIONS.length
                            }
                            onCheckedChange={toggleAllTherapeuticAreas}
                          />
                          <Label htmlFor="select-all-therapeutic" className="text-sm font-medium">
                            Select All
                          </Label>
                        </div>
                      </div>
                      {THERAPEUTIC_AREA_OPTIONS.map(area => (
                        <div key={area.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`therapeutic-${area.value}`}
                            checked={(form.getValues('therapeuticAreas') || []).includes(
                              area.value
                            )}
                            onCheckedChange={() => toggleTherapeuticArea(area.value)}
                          />
                          <Label htmlFor={`therapeutic-${area.value}`} className="text-sm">
                            {area.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industries"
                render={() => (
                  <FormItem>
                    <FormLabel>Industries</FormLabel>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      <div className="col-span-2 mb-2 md:col-span-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all-industries"
                            checked={
                              (form.getValues('industries') || []).length ===
                              INDUSTRY_OPTIONS.length
                            }
                            onCheckedChange={toggleAllIndustries}
                          />
                          <Label htmlFor="select-all-industries" className="text-sm font-medium">
                            Select All
                          </Label>
                        </div>
                      </div>
                      {INDUSTRY_OPTIONS.map(industry => (
                        <div key={industry.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`industry-${industry.value}`}
                            checked={(form.getValues('industries') || []).includes(industry.value)}
                            onCheckedChange={() => toggleIndustry(industry.value)}
                          />
                          <Label htmlFor={`industry-${industry.value}`} className="text-sm">
                            {industry.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : mode === 'edit'
                  ? 'Update Profile'
                  : 'Complete Onboarding'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
