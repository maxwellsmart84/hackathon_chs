import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Shield } from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">MI</span>
            </div>
            <span className="font-bold text-xl text-gray-900">MUSC Innovation Engine</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome! Let&apos;s get you started</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role to customize your experience and connect with the right people and resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Startup Option */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Startup</CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto">
                Entrepreneur
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                I&apos;m building a MedTech startup and looking for resources, expertise, and connections to accelerate growth.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li>• Access to MUSC experts</li>
                <li>• Research collaboration opportunities</li>
                <li>• Funding and grant guidance</li>
                <li>• Regulatory support</li>
              </ul>
              <Link href="/onboarding/startup">
                <Button className="w-full">
                  I&apos;m a Startup
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stakeholder Option */}
          <Card className="relative overflow-hidden border-2 hover:border-green-300 transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">MUSC Stakeholder</CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto">
                Internal
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                I&apos;m a MUSC researcher, clinician, or staff member ready to share expertise and collaborate with startups.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li>• Share your expertise</li>
                <li>• Mentor entrepreneurs</li>
                <li>• Access innovative solutions</li>
                <li>• Collaborate on research</li>
              </ul>
              <Link href="/onboarding/stakeholder">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  I&apos;m MUSC Staff
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Option */}
          <Card className="relative overflow-hidden border-2 hover:border-purple-300 transition-colors cursor-pointer group md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Administrator</CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto">
                Leadership
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                I&apos;m managing the Innovation Engine platform and need access to analytics and admin controls.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
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

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help choosing? <Link href="/contact" className="text-blue-600 hover:underline">Contact our team</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 