import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Lightbulb, Heart, Network } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import FeatureShowcase from "@/components/FeatureShowcase";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">MUSC Innovation Engine</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {userId ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="outline">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connecting <span className="text-green-600">MedTech Innovation</span> with MUSC Excellence
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Bridge the gap between groundbreaking startups and MUSC&apos;s world-class medical expertise. 
            Accelerate healthcare innovation through strategic partnerships.
          </p>
          
          {!userId && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Join as Startup
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
              <SignUpButton mode="modal">
                <Button size="lg" variant="outline">
                  Join as MUSC Stakeholder
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </div>
          )}

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation Matching</h3>
              <p className="text-gray-600">Smart algorithms connect startups with the right MUSC experts and resources</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Strategic Collaboration</h3>
              <p className="text-gray-600">Facilitate meaningful partnerships between industry and academia</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Profiles</h3>
              <p className="text-gray-600">Detailed profiles showcase capabilities, needs, and collaboration opportunities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">MVP Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform built with modern technologies, ready to demonstrate value and scale
            </p>
          </div>
          
          <FeatureShowcase />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Healthcare Innovation?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the MUSC Innovation Engine and be part of the future of medical technology
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
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">MUSC Innovation Engine</span>
            </div>
            <p className="text-gray-400 mb-8">
              Bridging innovation and healthcare excellence at the Medical University of South Carolina
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2024 Medical University of South Carolina. Built with ❤️ for healthcare innovation.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
