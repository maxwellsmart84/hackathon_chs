"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Building2, Target, Stethoscope, Briefcase, Tags } from "lucide-react";
import {
  StartupOnboardingSchema,
  type StartupOnboardingFormData,
  type FocusArea,
  type ProductType,
  type Technology,
  type BusinessNeed,
  FOCUS_AREA_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  TECHNOLOGY_OPTIONS,
  BUSINESS_NEEDS_OPTIONS,
  DevelopmentStageEnum,
  RegulatoryStatusEnum,
  NIHFundingInterestEnum,
} from "@/lib/validations/startup-onboarding";

interface StartupOnboardingFormProps {
  onSubmit: (data: StartupOnboardingFormData) => void;
}

export default function StartupOnboardingForm({ onSubmit }: StartupOnboardingFormProps) {
  const [newKeyword, setNewKeyword] = useState("");

  const form = useForm<StartupOnboardingFormData>({
    resolver: zodResolver(StartupOnboardingSchema),
    defaultValues: {
      name: "",
      description: "",
      stage: undefined,
      focusAreas: [],
      productTypes: [],
      technologies: [],
      needsClinicalTrials: false,
      businessNeeds: [],
      keywords: [],
    },
  });

  const handleSubmit = (data: StartupOnboardingFormData) => {
    console.log("Validated startup onboarding data:", data);
    onSubmit(data);
  };

  const toggleArrayValue = <T extends FocusArea | ProductType | Technology | BusinessNeed>(
    fieldName: keyof Pick<StartupOnboardingFormData, 'focusAreas' | 'productTypes' | 'technologies' | 'businessNeeds'>, 
    value: T
  ) => {
    const currentValues = form.getValues(fieldName) || [];
    const newValues = currentValues.includes(value as never)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value as never];
    form.setValue(fieldName, newValues);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !form.getValues('keywords')?.includes(newKeyword.trim())) {
      const currentKeywords = form.getValues('keywords') || [];
      if (currentKeywords.length < 10) {
        form.setValue('keywords', [...currentKeywords, newKeyword.trim()]);
        setNewKeyword("");
      }
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords') || [];
    form.setValue('keywords', currentKeywords.filter(k => k !== keyword));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Startup Onboarding</h1>
        </div>
        <p className="text-gray-600">Complete your profile to connect with MUSC experts and resources</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          
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
                name="name"
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {focusAreaOptions.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={`focus-${area}`}
                            checked={form.getValues('focusAreas')?.includes(area) || false}
                            onCheckedChange={() => toggleArrayValue('focusAreas', area)}
                          />
                          <Label htmlFor={`focus-${area}`} className="text-sm">{area}</Label>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {productTypeOptions.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`product-${type}`}
                            checked={form.getValues('productTypes')?.includes(type) || false}
                            onCheckedChange={() => toggleArrayValue('productTypes', type)}
                          />
                          <Label htmlFor={`product-${type}`} className="text-sm">{type}</Label>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {technologyOptions.map((tech) => (
                        <div key={tech} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tech-${tech}`}
                            checked={form.getValues('technologies')?.includes(tech) || false}
                            onCheckedChange={() => toggleArrayValue('technologies', tech)}
                          />
                          <Label htmlFor={`tech-${tech}`} className="text-sm">{tech}</Label>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your regulatory status (optional)" />
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
                      <FormLabel className="text-base">Clinical Trials Required</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Does your product require clinical trials for validation?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Are you interested in NIH funding opportunities?" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {businessNeedsOptions.map((need) => (
                        <div key={need} className="flex items-center space-x-2">
                          <Checkbox
                            id={`business-${need}`}
                            checked={form.getValues('businessNeeds')?.includes(need) || false}
                            onCheckedChange={() => toggleArrayValue('businessNeeds', need)}
                          />
                          <Label htmlFor={`business-${need}`} className="text-sm">{need}</Label>
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
                <span>Keywords & Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="keywords"
                render={() => (
                  <FormItem>
                    <FormLabel>Keywords (Optional, max 10)</FormLabel>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a keyword or tag"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={(e) => {
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
                          disabled={(form.getValues('keywords')?.length || 0) >= 10}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {form.getValues('keywords') && form.getValues('keywords')!.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {form.getValues('keywords')!.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <span>{keyword}</span>
                              <button
                                type="button"
                                onClick={() => removeKeyword(keyword)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button type="submit" size="lg" className="px-8">
              Complete Onboarding
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 