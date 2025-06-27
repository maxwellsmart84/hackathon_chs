'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import StakeholderOnboardingForm from '@/components/forms/StakeholderOnboardingForm';
import { type StakeholderOnboardingFormData } from '@/components/forms/StakeholderOnboardingForm';

export default function StakeholderOnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<{
    firstName?: string;
    lastName?: string;
    userId: string;
  } | null>(null);

  // Check if user has already completed onboarding
  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has already completed onboarding
      const metadata = user.publicMetadata as { userType?: string; onboardingComplete?: boolean };

      if (metadata.onboardingComplete && metadata.userType === 'stakeholder') {
        // User has already completed stakeholder onboarding, redirect to dashboard
        router.push('/dashboard/stakeholder');
        return;
      }

      // If user has completed onboarding for a different type, show error
      if (metadata.onboardingComplete && metadata.userType !== 'stakeholder') {
        toast.error('You have already completed onboarding as a ' + metadata.userType);
        router.push('/dashboard');
        return;
      }

      // Set user data for form
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        userId: user.id,
      });
    }
  }, [isLoaded, user, router]);

  const handleSubmit = async (data: StakeholderOnboardingFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting stakeholder onboarding data:', data);

      const response = await fetch('/api/stakeholders/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError);
          throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
        }

        throw new Error(errorData.error || `Server error (${response.status})`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      toast.success(result.message || 'Stakeholder profile saved successfully!');

      // Force refresh user to get updated metadata
      await user?.reload();

      router.push('/dashboard/stakeholder');
    } catch (error) {
      console.error('Onboarding submission failed:', error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        console.error('Unknown error type:', typeof error, error);
        toast.error('Failed to save stakeholder profile - unknown error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <StakeholderOnboardingForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      initialUserData={userData || undefined}
    />
  );
}
