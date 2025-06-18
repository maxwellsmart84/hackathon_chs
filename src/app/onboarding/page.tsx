'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import StartupOnboardingForm from '@/components/forms/StartupOnboardingForm';
import { StartupOnboardingFormData } from '@/lib/db/schema-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: StartupOnboardingFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/startups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save startup profile');
      }

      toast.success('Your startup profile has been saved!');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving startup profile:', error);
      toast.error('Failed to save your startup profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
              <span className="text-sm font-bold text-white">MI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Hackathon Innovation Engine</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Welcome! Let&apos;s get you started
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose your role to customize your experience and connect with the right people and
            resources.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Startup Option */}
          <Card className="group relative cursor-pointer overflow-hidden border-2 transition-colors hover:border-blue-300">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-200">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Startup</CardTitle>
              <Badge variant="secondary" className="mx-auto w-fit">
                Entrepreneur
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-gray-600">
                I&apos;m building a MedTech startup and looking for resources, expertise, and
                connections to accelerate growth.
              </p>
              <ul className="mb-6 space-y-2 text-sm text-gray-500">
                <li>• Access to Hackathon experts</li>
                <li>• Research collaboration opportunities</li>
                <li>• Funding and grant guidance</li>
                <li>• Regulatory support</li>
              </ul>
              <Link href="/onboarding/startup">
                <Button className="w-full">I&apos;m a Startup</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stakeholder Option */}
          <Card className="group relative cursor-pointer overflow-hidden border-2 transition-colors hover:border-green-300">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-200">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Hackathon Stakeholder</CardTitle>
              <Badge variant="secondary" className="mx-auto w-fit">
                Internal
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-gray-600">
                I&apos;m a Hackathon researcher, clinician, or staff member ready to share expertise
                and collaborate with startups.
              </p>
              <ul className="mb-6 space-y-2 text-sm text-gray-500">
                <li>• Share your expertise</li>
                <li>• Mentor entrepreneurs</li>
                <li>• Access innovative solutions</li>
                <li>• Collaborate on research</li>
              </ul>
              <Link href="/onboarding/stakeholder">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  I&apos;m Hackathon Staff
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Option */}
          <Card className="group relative cursor-pointer overflow-hidden border-2 transition-colors hover:border-purple-300 md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 transition-colors group-hover:bg-purple-200">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Administrator</CardTitle>
              <Badge variant="secondary" className="mx-auto w-fit">
                Leadership
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-gray-600">
                I&apos;m managing the Innovation Engine platform and need access to analytics and
                admin controls.
              </p>
              <ul className="mb-6 space-y-2 text-sm text-gray-500">
                <li>• Platform analytics</li>
                <li>• User management</li>
                <li>• Connection insights</li>
                <li>• Performance metrics</li>
              </ul>
              <Link href="/onboarding/admin">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  I&apos;m an Administrator
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help choosing?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact our team
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <StartupOnboardingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}
