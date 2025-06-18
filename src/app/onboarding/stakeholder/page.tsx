'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function StakeholderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    specialties: [] as string[],
    expertiseAreas: [] as string[],
    availableResources: [] as string[],
    collaborationInterests: [] as string[],
    researchInterests: '',
    availabilityStatus: 'available',
    mentorshipInterest: false,
    bio: '',
  });
  const [currentSpecialty, setCurrentSpecialty] = useState('');
  const [currentCollaboration, setCurrentCollaboration] = useState('');

  const departments = [
    { value: 'anesthesia', label: 'Anesthesia' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'emergency-medicine', label: 'Emergency Medicine' },
    { value: 'family-medicine', label: 'Family Medicine' },
    { value: 'internal-medicine', label: 'Internal Medicine' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'urology', label: 'Urology' },
    { value: 'nursing', label: 'Nursing' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'public-health', label: 'Public Health' },
    { value: 'biomedical-informatics', label: 'Biomedical Informatics' },
    { value: 'bioengineering', label: 'Bioengineering' },
    { value: 'research-administration', label: 'Research Administration' },
    { value: 'technology-transfer', label: 'Technology Transfer' },
    { value: 'innovation-center', label: 'Innovation Center' },
    { value: 'other', label: 'Other' },
  ];

  const expertiseAreas = [
    { value: 'clinical-trials', label: 'Clinical Trials' },
    { value: 'regulatory-affairs', label: 'Regulatory Affairs' },
    { value: 'intellectual-property', label: 'Intellectual Property' },
    { value: 'medical-device-development', label: 'Medical Device Development' },
    { value: 'software-development', label: 'Software Development' },
    { value: 'data-analysis', label: 'Data Analysis' },
    { value: 'biostatistics', label: 'Biostatistics' },
    { value: 'grant-writing', label: 'Grant Writing' },
    { value: 'commercialization', label: 'Commercialization' },
    { value: 'market-research', label: 'Market Research' },
    { value: 'user-experience', label: 'User Experience' },
    { value: 'quality-assurance', label: 'Quality Assurance' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'strategic-planning', label: 'Strategic Planning' },
    { value: 'fundraising', label: 'Fundraising' },
    { value: 'networking', label: 'Networking' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'other', label: 'Other' },
  ];

  const resourceTypes = [
    { value: 'laboratory-space', label: 'Laboratory Space' },
    { value: 'clinical-data', label: 'Clinical Data' },
    { value: 'patient-populations', label: 'Patient Populations' },
    { value: 'research-equipment', label: 'Research Equipment' },
    { value: 'computational-resources', label: 'Computational Resources' },
    { value: 'funding-opportunities', label: 'Funding Opportunities' },
    { value: 'regulatory-guidance', label: 'Regulatory Guidance' },
    { value: 'legal-support', label: 'Legal Support' },
    { value: 'marketing-support', label: 'Marketing Support' },
    { value: 'business-development', label: 'Business Development' },
    { value: 'technical-expertise', label: 'Technical Expertise' },
    { value: 'clinical-expertise', label: 'Clinical Expertise' },
    { value: 'administrative-support', label: 'Administrative Support' },
    { value: 'networking-opportunities', label: 'Networking Opportunities' },
    { value: 'educational-resources', label: 'Educational Resources' },
    { value: 'other', label: 'Other' },
  ];

  const availabilityStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'unavailable', label: 'Unavailable' },
  ];

  const addToArray = (field: 'specialties' | 'collaborationInterests', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeFromArray = (field: 'specialties' | 'collaborationInterests', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const toggleArrayItem = (field: 'expertiseAreas' | 'availableResources', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const isSelected = currentArray.includes(value);

      return {
        ...prev,
        [field]: isSelected
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value],
      };
    });
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.department) newErrors.department = 'Please select your department';
      if (!formData.expertiseAreas.length)
        newErrors.expertiseAreas = 'Please select at least one area of expertise';
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
        // TODO: Submit to API
        console.log('Stakeholder data:', formData);
        router.push('/dashboard');
      } catch (error) {
        console.error('Submission error:', error);
      }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Professional Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className={errors.title ? 'border-red-500' : ''}
          placeholder="e.g., Chief of Cardiology, Research Scientist, Clinical Coordinator..."
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <Label>Department/Division *</Label>
        <div className="mt-2 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
          {departments.map(dept => (
            <Button
              key={dept.value}
              type="button"
              variant={formData.department === dept.value ? 'default' : 'outline'}
              className="h-auto justify-start p-3 text-left text-sm"
              onClick={() => setFormData(prev => ({ ...prev, department: dept.value }))}
            >
              {dept.label}
            </Button>
          ))}
        </div>
        {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department}</p>}
      </div>

      <div>
        <Label>Areas of Expertise *</Label>
        <p className="mb-3 text-sm text-gray-600">
          Select all areas where you can provide expertise or guidance to startups
        </p>
        <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
          {expertiseAreas.map(area => (
            <Button
              key={area.value}
              type="button"
              variant={formData.expertiseAreas.includes(area.value) ? 'default' : 'outline'}
              className="h-auto justify-start p-3 text-left text-sm"
              onClick={() => toggleArrayItem('expertiseAreas', area.value)}
            >
              {area.label}
            </Button>
          ))}
        </div>
        {errors.expertiseAreas && (
          <p className="mt-1 text-sm text-red-500">{errors.expertiseAreas}</p>
        )}
      </div>

      <div>
        <Label>Medical Specialties (Optional)</Label>
        <p className="mb-3 text-sm text-gray-600">
          Add specific medical specialties or sub-specializations
        </p>
        <div className="mb-3 flex gap-2">
          <Input
            value={currentSpecialty}
            onChange={e => setCurrentSpecialty(e.target.value)}
            placeholder="e.g., Interventional Cardiology, Pediatric Oncology..."
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('specialties', currentSpecialty);
                setCurrentSpecialty('');
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addToArray('specialties', currentSpecialty);
              setCurrentSpecialty('');
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {specialty}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => removeFromArray('specialties', index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Available Resources</Label>
        <p className="mb-3 text-sm text-gray-600">
          What resources can you provide or help startups access?
        </p>
        <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
          {resourceTypes.map(resource => (
            <Button
              key={resource.value}
              type="button"
              variant={formData.availableResources.includes(resource.value) ? 'default' : 'outline'}
              className="h-auto justify-start p-3 text-left text-sm"
              onClick={() => toggleArrayItem('availableResources', resource.value)}
            >
              {resource.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Collaboration Interests</Label>
        <p className="mb-3 text-sm text-gray-600">
          What types of projects or collaborations interest you most?
        </p>
        <div className="mb-3 flex gap-2">
          <Input
            value={currentCollaboration}
            onChange={e => setCurrentCollaboration(e.target.value)}
            placeholder="e.g., Early-stage device development, Clinical validation studies..."
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('collaborationInterests', currentCollaboration);
                setCurrentCollaboration('');
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addToArray('collaborationInterests', currentCollaboration);
              setCurrentCollaboration('');
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.collaborationInterests.map((interest, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {interest}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => removeFromArray('collaborationInterests', index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="researchInterests">Research Interests</Label>
        <Textarea
          id="researchInterests"
          value={formData.researchInterests}
          onChange={e => setFormData(prev => ({ ...prev, researchInterests: e.target.value }))}
          placeholder="Describe your current research focus and interests..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Availability Status</Label>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {availabilityStatuses.map(status => (
              <Button
                key={status.value}
                type="button"
                variant={formData.availabilityStatus === status.value ? 'default' : 'outline'}
                className="h-auto justify-start p-3 text-left"
                onClick={() => setFormData(prev => ({ ...prev, availabilityStatus: status.value }))}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Mentorship</Label>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <Button
              type="button"
              variant={formData.mentorshipInterest ? 'default' : 'outline'}
              className="h-auto justify-start p-3 text-left"
              onClick={() => setFormData(prev => ({ ...prev, mentorshipInterest: true }))}
            >
              ✅ I&apos;m interested in mentoring
            </Button>
            <Button
              type="button"
              variant={!formData.mentorshipInterest ? 'default' : 'outline'}
              className="h-auto justify-start p-3 text-left"
              onClick={() => setFormData(prev => ({ ...prev, mentorshipInterest: false }))}
            >
              📋 Just collaboration/resources
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Professional Bio (Optional)</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Brief professional background that startups might find relevant..."
          rows={3}
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/500 characters</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/onboarding"
            className="mb-4 inline-flex items-center text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to selection
          </Link>
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Hackathon Stakeholder Onboarding
            </span>
          </div>
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
          </div>
          <p className="text-sm text-gray-600">Step {step} of 2</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? 'Professional Profile' : 'Expertise & Availability'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? renderStep1() : renderStep2()}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}

              <div className="ml-auto">
                {step < 2 ? (
                  <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
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
