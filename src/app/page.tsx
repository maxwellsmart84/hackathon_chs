import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Lightbulb, Heart, Network } from 'lucide-react';
import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';

import { auth } from '@clerk/nextjs/server';
import FeatureShowcase from '@/components/FeatureShowcase';

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            Connecting <span className="text-green-600">MedTech Innovation</span> with Hackathon
            Excellence
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Bridge the gap between groundbreaking startups and Hackathon&apos;s world-class medical
            expertise. Accelerate healthcare innovation through strategic partnerships.
          </p>

          {!userId && (
            <div className="mb-12 flex justify-center">
              <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding/startup">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Get Started as a Startup
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </div>
          )}

          {!userId && (
            <div className="mb-12 text-center">
              <p className="mb-4 text-gray-600">Are you a CRO, investor, or consultant?</p>
              <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding/stakeholder">
                <Button variant="outline" size="lg">
                  Join as a Stakeholder
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </div>
          )}

          {/* Value Props */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Lightbulb className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Innovation Matching</h3>
              <p className="text-gray-600">
                Smart algorithms connect startups with the right Hackathon experts and resources
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Network className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Strategic Collaboration</h3>
              <p className="text-gray-600">
                Facilitate meaningful partnerships between industry and academia
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Comprehensive Profiles</h3>
              <p className="text-gray-600">
                Detailed profiles showcase capabilities, needs, and collaboration opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">MVP Capabilities</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              A comprehensive platform built with modern technologies, ready to demonstrate value
              and scale
            </p>
          </div>

          <FeatureShowcase />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Accelerate Healthcare Innovation?</h2>
          <p className="mb-8 text-xl opacity-90">
            Join the Hackathon Innovation Engine and be part of the future of medical technology
          </p>

          {userId ? (
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <Button size="lg" variant="secondary">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-600">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Hackathon Innovation Engine</span>
            </div>
            <p className="mb-8 text-gray-400">
              Bridging innovation and healthcare excellence at the Medical University of South
              Carolina
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2024 Maxwell Krause. Built with ❤️ for healthcare innovation.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
