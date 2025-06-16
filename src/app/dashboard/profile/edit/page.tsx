'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import StartupOnboardingForm from '@/components/forms/StartupOnboardingForm';
import { type StartupOnboardingFormData } from '@/lib/db/schema-types';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    firstName?: string;
    lastName?: string;
    userId: string;
  } | null>(null);
  const [startupData, setStartupData] = useState<Partial<StartupOnboardingFormData> | null>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      // Fetch the existing startup profile
      const response = await fetch('/api/startups');
      if (response.ok) {
        const profileData = await response.json();

        // Split the data into user and startup parts
        setUserData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          userId: profileData.userId,
        });

        setStartupData({
          ...profileData,
          // Remove user fields from startup data
          firstName: undefined,
          lastName: undefined,
          userId: undefined,
        });
      } else if (response.status === 404) {
        // No startup profile found, redirect to onboarding
        toast.error('No startup profile found. Please complete onboarding first.');
        router.push('/onboarding/startup');
        return;
      } else {
        throw new Error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfileData();
    }
  }, [isLoaded, user, fetchProfileData]);

  const handleSubmit = async (data: StartupOnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/startups/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }
        throw new Error(errorData.error || `Server error (${response.status})`);
      }

      const result = await response.json();
      toast.success(result.message || 'Profile updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Profile update failed:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || isLoading) {
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
    <StartupOnboardingForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      initialUserData={userData || undefined}
      initialStartupData={startupData || undefined}
      mode="edit"
    />
  );
}
