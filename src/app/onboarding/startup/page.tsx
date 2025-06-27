'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import StartupOnboardingForm from '@/components/forms/StartupOnboardingForm';
import { type StartupOnboardingFormData } from '@/lib/db/schema-types';
import LoadingOverlay from '@/components/ui/loading-overlay';

export default function StartupOnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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

      if (metadata.onboardingComplete && metadata.userType === 'startup') {
        // User has already completed startup onboarding, redirect to dashboard
        setIsInitialLoading(false);
        router.push('/dashboard');
        return;
      }

      // If user has completed onboarding for a different type, show error
      if (metadata.onboardingComplete && metadata.userType !== 'startup') {
        toast.error('You have already completed onboarding as a ' + metadata.userType);
        setIsInitialLoading(false);
        router.push('/dashboard');
        return;
      }

      // Set user data for form
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        userId: user.id,
      });

      setIsInitialLoading(false);
    }
  }, [isLoaded, user, router]);

  const handleSubmit = async (data: StartupOnboardingFormData) => {
    try {
      setIsSubmitting(true);

      console.log('Submitting startup onboarding data:', data);

      const response = await fetch('/api/startups/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save startup profile');
      }

      toast.success('Startup profile saved successfully!', {
        description: 'Welcome to the MUSC Innovation Engine',
      });

      // Redirect to dashboard after successful submission
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting startup onboarding:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save startup profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading overlay while checking auth status or during submission
  if (isInitialLoading) {
    return (
      <LoadingOverlay
        isVisible={true}
        message="Preparing your startup onboarding..."
        submessage="Setting up your profile and preferences"
      />
    );
  }

  // Don't render form until we have user data
  if (!userData) {
    return (
      <LoadingOverlay
        isVisible={true}
        message="Loading your account..."
        submessage="Just a moment while we fetch your details"
      />
    );
  }

  return (
    <>
      <LoadingOverlay
        isVisible={isSubmitting}
        message="Saving your startup profile..."
        submessage="Creating your account and setting up recommendations"
      />

      <div className="container mx-auto max-w-4xl py-8">
        <StartupOnboardingForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialUserData={userData}
        />
      </div>
    </>
  );
}
