'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchUserData = useCallback(async () => {
    try {
      // Try to fetch user data from our database first
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const dbUser = await response.json();
        setUserData({
          firstName: dbUser.user?.firstName || user?.firstName || '',
          lastName: dbUser.user?.lastName || user?.lastName || '',
          userId: dbUser.user?.id,
        });
      } else {
        // Fallback to Clerk data if user not in database yet
        setUserData({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          userId: user?.id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to Clerk data
      if (user) {
        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          userId: user.id,
        });
      }
    }
  }, [user]);

  // Fetch user data when Clerk user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      // First try to get from the database, fallback to Clerk data
      fetchUserData();
    }
  }, [isLoaded, user, fetchUserData]);

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
