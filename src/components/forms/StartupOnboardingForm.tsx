'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import {
  X,
  Plus,
  Building2,
  Target,
  Stethoscope,
  Briefcase,
  Tags,
  User,
  Loader2,
} from 'lucide-react';
import { startupOnboardingFormSchema, type StartupOnboardingFormData } from '@/lib/db/schema-types';
import PageHeader from '@/components/layout/PageHeader';

// Option arrays with proper typing
export const FOCUS_AREA_OPTIONS = [
  'Cardiology',
  'Oncology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Vascular',
  'Surgery',
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
  'Funding',
  'IP & Licensing',
  'Academic Collaboration',
  'Tech Transfer',
  'Commercialization Support',
  'Other',
] as const;

interface StartupOnboardingFormProps {
  onSubmit: (data: StartupOnboardingFormData) => void;
  isSubmitting?: boolean;
  initialUserData?: {
    firstName?: string;
    lastName?: string;
    userId: string;
  };
  initialStartupData?: Partial<StartupOnboardingFormData>;
  mode?: 'create' | 'edit';
}

export default function StartupOnboardingForm({
  onSubmit,
  isSubmitting,
  initialUserData,
  initialStartupData,
  mode = 'create',
}: StartupOnboardingFormProps) {
  const [newKeyword, setNewKeyword] = useState('');

  const form = useForm({
    resolver: zodResolver(startupOnboardingFormSchema),
    defaultValues: {
      userId: '',
      firstName: '',
      lastName: '',
      companyName: '',
      description: '',
      stage: 'Idea' as const,
      focusAreas: [] as string[],
      productTypes: [] as string[],
      technologies: [] as string[],
      regulatoryStatus: undefined,
      needsClinicalTrials: false,
      nihFundingInterest: undefined,
      businessNeeds: [] as string[],
      keywords: [] as string[],
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
    }
  }, [initialUserData, form]);

  // Pre-populate startup data when editing
  useEffect(() => {
    if (initialStartupData) {
      Object.entries(initialStartupData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.setValue(key as keyof StartupOnboardingFormData, value);
        }
      });
    }
  }, [initialStartupData, form]);

  const handleSubmit = (data: StartupOnboardingFormData) => {
    console.log('Validated startup onboarding data:', data);
    onSubmit(data);
  };

  // Type-safe toggle functions for each field
  const toggleFocusArea = (value: string) => {
    const currentValues = form.getValues('focusAreas') || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    form.setValue('focusAreas', newValues);
  };

  const toggleProductType = (value: string) => {
    const currentValues = form.getValues('productTypes') || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    form.setValue('productTypes', newValues);
  };

  const toggleTechnology = (value: string) => {
    const currentValues = form.getValues('technologies') || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    form.setValue('technologies', newValues);
  };

  const toggleBusinessNeed = (value: string) => {
    const currentValues = form.getValues('businessNeeds') || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    form.setValue('businessNeeds', newValues);
  };

  const addKeyword = () => {
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword) {
      const currentKeywords = form.getValues('keywords') || [];
      const lowercaseKeywords = currentKeywords.map(k => k.toLowerCase());

      // Check for duplicates (case-insensitive) and length limit
      if (
        !lowercaseKeywords.includes(trimmedKeyword.toLowerCase()) &&
        currentKeywords.length < 10
      ) {
        form.setValue('keywords', [...currentKeywords, trimmedKeyword]);
        setNewKeyword('');
      }
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords') || [];
    form.setValue(
      'keywords',
      currentKeywords.filter(k => k !== keyword)
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <PageHeader
        title={mode === 'edit' ? 'Edit Startup Profile' : 'Startup Onboarding'}
        description={
          mode === 'edit'
            ? 'Update your startup profile information'
            : 'Complete your profile to connect with Hackathon experts and resources'
        }
        icon={Building2}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Section 0: Personal Information */}
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
            </CardContent>
          </Card>

          {/* Section 1: Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Company Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your company, the problem you're solving, and your approach (minimum 30 characters)"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Development Stage *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current development stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Idea">Idea</SelectItem>
                        <SelectItem value="Prototype">Prototype</SelectItem>
                        <SelectItem value="Pre-Clinical">Pre-Clinical</SelectItem>
                        <SelectItem value="FDA Submission">FDA Submission</SelectItem>
                        <SelectItem value="Post-Market">Post-Market</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 2: Focus Areas & Technology */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Focus Areas & Technology</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="focusAreas"
                render={() => (
                  <FormItem>
                    <FormLabel>Medical Focus Areas *</FormLabel>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {FOCUS_AREA_OPTIONS.map(area => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={`focus-${area}`}
                            checked={(form.getValues('focusAreas') || []).includes(area)}
                            onCheckedChange={() => toggleFocusArea(area)}
                          />
                          <Label htmlFor={`focus-${area}`} className="text-sm">
                            {area}
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
                name="productTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Product Types *</FormLabel>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {PRODUCT_TYPE_OPTIONS.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`product-${type}`}
                            checked={(form.getValues('productTypes') || []).includes(type)}
                            onCheckedChange={() => toggleProductType(type)}
                          />
                          <Label htmlFor={`product-${type}`} className="text-sm">
                            {type}
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
                name="technologies"
                render={() => (
                  <FormItem>
                    <FormLabel>Technologies *</FormLabel>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {TECHNOLOGY_OPTIONS.map(tech => (
                        <div key={tech} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tech-${tech}`}
                            checked={(form.getValues('technologies') || []).includes(tech)}
                            onCheckedChange={() => toggleTechnology(tech)}
                          />
                          <Label htmlFor={`tech-${tech}`} className="text-sm">
                            {tech}
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

          {/* Section 3: Regulatory & Clinical */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-red-600" />
                <span>Regulatory & Clinical</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="regulatoryStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regulatory Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your regulatory status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Pre-IDE">Pre-IDE</SelectItem>
                        <SelectItem value="IDE Filed">IDE Filed</SelectItem>
                        <SelectItem value="FDA Submission">FDA Submission</SelectItem>
                        <SelectItem value="510(k)">510(k)</SelectItem>
                        <SelectItem value="De Novo">De Novo</SelectItem>
                        <SelectItem value="PMA">PMA</SelectItem>
                        <SelectItem value="Post-Market">Post-Market</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="needsClinicalTrials"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Clinical Trials</FormLabel>
                      <div className="text-sm text-gray-500">
                        Does your product require clinical trials?
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nihFundingInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIH Funding Interest</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your NIH funding interest" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Interested">Interested</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 4: Business Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <span>Business Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="businessNeeds"
                render={() => (
                  <FormItem>
                    <FormLabel>Business Support Needs</FormLabel>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {BUSINESS_NEEDS_OPTIONS.map(need => (
                        <div key={need} className="flex items-center space-x-2">
                          <Checkbox
                            id={`need-${need}`}
                            checked={(form.getValues('businessNeeds') || []).includes(need)}
                            onCheckedChange={() => toggleBusinessNeed(need)}
                          />
                          <Label htmlFor={`need-${need}`} className="text-sm">
                            {need}
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

          {/* Section 5: Keywords/Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tags className="h-5 w-5 text-orange-600" />
                <span>Keywords/Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="keywords"
                render={() => (
                  <FormItem>
                    <FormLabel>Keywords (up to 10)</FormLabel>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a keyword"
                          value={newKeyword}
                          onChange={e => setNewKeyword(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addKeyword();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addKeyword}
                          disabled={!newKeyword.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(form.getValues('keywords') || []).map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center space-x-1"
                          >
                            <span>{keyword}</span>
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="ml-1 rounded-full p-1 hover:bg-gray-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : mode === 'edit' ? 'Update Profile' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
