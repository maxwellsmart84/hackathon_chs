"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import Link from "next/link";
import { 
  StartupProfileSchema, 
  FocusAreaSchema, 
  StartupStageSchema, 
  FundingStatusSchema,
  type StartupProfile,
  type FocusArea,
  type StartupStage,
  type FundingStatus
} from "@/lib/validations";

export default function StartupOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<StartupProfile>>({
    currentGoals: [],
    currentNeeds: [],
    milestones: [],
  });
  const [currentGoal, setCurrentGoal] = useState("");
  const [currentNeed, setCurrentNeed] = useState("");

  const focusAreas = FocusAreaSchema.options.map(area => ({
    value: area,
    label: area.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));

  const stages = StartupStageSchema.options.map(stage => ({
    value: stage,
    label: stage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));

  const fundingStatuses = FundingStatusSchema.options.map(status => ({
    value: status,
    label: status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));

  const addToArray = (field: 'currentGoals' | 'currentNeeds', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeFromArray = (field: 'currentGoals' | 'currentNeeds', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.companyName?.trim()) newErrors.companyName = "Company name is required";
      if (!formData.description?.trim() || formData.description.length < 10) {
        newErrors.description = "Please provide a meaningful description (at least 10 characters)";
      }
      if (!formData.focusArea) newErrors.focusArea = "Please select a focus area";
      if (!formData.stage) newErrors.stage = "Please select your current stage";
    }
    
    if (stepNumber === 2) {
      if (!formData.currentGoals?.length) newErrors.currentGoals = "Please specify at least one current goal";
      if (!formData.currentNeeds?.length) newErrors.currentNeeds = "Please specify at least one current need";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(step)) {
      try {
        const validatedData = StartupProfileSchema.parse(formData);
        // TODO: Submit to API
        console.log("Validated startup data:", validatedData);
        router.push("/dashboard");
      } catch (error) {
        console.error("Validation error:", error);
      }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          value={formData.companyName || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          className={errors.companyName ? "border-red-500" : ""}
          placeholder="Enter your company name"
        />
        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
      </div>

      <div>
        <Label htmlFor="description">Company Description *</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={errors.description ? "border-red-500" : ""}
          placeholder="Describe what your company does, the problem you're solving, and your approach..."
          rows={4}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://yourcompany.com"
        />
      </div>

      <div>
        <Label>Focus Area *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {focusAreas.map((area) => (
            <Button
              key={area.value}
              type="button"
              variant={formData.focusArea === area.value ? "default" : "outline"}
              className="justify-start h-auto p-3 text-left"
              onClick={() => setFormData(prev => ({ ...prev, focusArea: area.value as FocusArea }))}
            >
              {area.label}
            </Button>
          ))}
        </div>
        {errors.focusArea && <p className="text-red-500 text-sm mt-1">{errors.focusArea}</p>}
      </div>

      <div>
        <Label>Current Stage *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {stages.map((stage) => (
            <Button
              key={stage.value}
              type="button"
              variant={formData.stage === stage.value ? "default" : "outline"}
              className="justify-start h-auto p-3 text-left"
              onClick={() => setFormData(prev => ({ ...prev, stage: stage.value as StartupStage }))}
            >
              {stage.label}
            </Button>
          ))}
        </div>
        {errors.stage && <p className="text-red-500 text-sm mt-1">{errors.stage}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Current Goals *</Label>
        <p className="text-sm text-gray-600 mb-3">What are you trying to achieve in the next 6-12 months?</p>
        <div className="flex gap-2 mb-3">
          <Input
            value={currentGoal}
            onChange={(e) => setCurrentGoal(e.target.value)}
            placeholder="e.g., Complete clinical validation, Secure Series A funding..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('currentGoals', currentGoal);
                setCurrentGoal("");
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addToArray('currentGoals', currentGoal);
              setCurrentGoal("");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.currentGoals?.map((goal, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {goal}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => removeFromArray('currentGoals', index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        {errors.currentGoals && <p className="text-red-500 text-sm mt-1">{errors.currentGoals}</p>}
      </div>

      <div>
        <Label>Current Needs *</Label>
        <p className="text-sm text-gray-600 mb-3">What specific resources or support do you need?</p>
        <div className="flex gap-2 mb-3">
          <Input
            value={currentNeed}
            onChange={(e) => setCurrentNeed(e.target.value)}
            placeholder="e.g., Clinical expertise, Regulatory guidance, Lab access..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('currentNeeds', currentNeed);
                setCurrentNeed("");
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addToArray('currentNeeds', currentNeed);
              setCurrentNeed("");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.currentNeeds?.map((need, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {need}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => removeFromArray('currentNeeds', index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        {errors.currentNeeds && <p className="text-red-500 text-sm mt-1">{errors.currentNeeds}</p>}
      </div>

      <div>
        <Label>Funding Status</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {fundingStatuses.map((status) => (
            <Button
              key={status.value}
              type="button"
              variant={formData.fundingStatus === status.value ? "default" : "outline"}
              className="justify-start h-auto p-3 text-left"
              onClick={() => setFormData(prev => ({ ...prev, fundingStatus: status.value as FundingStatus }))}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="teamSize">Team Size</Label>
          <Input
            id="teamSize"
            type="number"
            min="1"
            value={formData.teamSize || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) || undefined }))}
            placeholder="e.g., 5"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Charleston, SC"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/onboarding" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to selection
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Startup Onboarding</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-8 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
          <p className="text-sm text-gray-600">Step {step} of 2</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Company Information" : "Goals & Resources"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? renderStep1() : renderStep2()}
            
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                {step < 2 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    Complete Setup
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 