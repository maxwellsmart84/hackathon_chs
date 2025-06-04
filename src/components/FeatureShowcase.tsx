"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Network, 
  BarChart3, 
  Rocket, 
  Stethoscope,
  Shield,
  Zap,
  Database,
  MessageCircle
} from "lucide-react";

export default function FeatureShowcase() {
  const features = [
    {
      icon: Users,
      title: "Multi-User Profiles",
      description: "Comprehensive profiles for startups and MUSC stakeholders with role-based access",
      tags: ["Onboarding", "Authentication", "Clerk.js"],
      status: "✅ Complete"
    },
    {
      icon: Search,
      title: "Smart Discovery",
      description: "Advanced search and filtering for both startups and stakeholders with pagination",
      tags: ["Search API", "Filtering", "Pagination"],
      status: "✅ Complete"
    },
    {
      icon: Network,
      title: "Connection System",
      description: "Request and manage connections between startups and MUSC internal resources",
      tags: ["Networking", "Collaboration", "API"],
      status: "✅ Complete"
    },
    {
      icon: Database,
      title: "Scalable Database",
      description: "MySQL database with Drizzle ORM, proper indexing, and relationships",
      tags: ["PlanetScale", "Drizzle", "Migrations"],
      status: "✅ Complete"
    },
    {
      icon: Shield,
      title: "Authentication & Security",
      description: "Secure authentication with role-based access control and protected routes",
      tags: ["Clerk.js", "Middleware", "RBAC"],
      status: "✅ Complete"
    },
    {
      icon: Zap,
      title: "Modern UI/UX",
      description: "Beautiful, responsive interface built with Next.js 15 and Tailwind CSS v4",
      tags: ["shadcn/ui", "Tailwind", "Responsive"],
      status: "✅ Complete"
    },
    {
      icon: MessageCircle,
      title: "Validation System",
      description: "Comprehensive form validation using Zod schemas with type safety",
      tags: ["Zod", "TypeScript", "Validation"],
      status: "✅ Complete"
    },
    {
      icon: BarChart3,
      title: "Analytics Ready",
      description: "Database schema designed for tracking metrics and generating insights",
      tags: ["Analytics", "Metrics", "Dashboard"],
      status: "🏗️ Framework"
    }
  ];

  const techStack = [
    { name: "Next.js 15", category: "Framework" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind CSS v4", category: "Styling" },
    { name: "shadcn/ui", category: "Components" },
    { name: "Clerk.js", category: "Auth" },
    { name: "PlanetScale", category: "Database" },
    { name: "Drizzle ORM", category: "ORM" },
    { name: "Zod", category: "Validation" }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 mb-2">7/8</div>
            <p className="text-sm text-gray-600">Core Features Complete</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">6</div>
            <p className="text-sm text-gray-600">Database Tables</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">10+</div>
            <p className="text-sm text-gray-600">API Endpoints</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600 mb-2">100%</div>
            <p className="text-sm text-gray-600">Type Safe</p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">MVP Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <feature.icon className="h-8 w-8 text-green-600 mb-2" />
                  <Badge variant={feature.status.startsWith('✅') ? 'default' : 'secondary'} className="text-xs">
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-1">
                  {feature.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techStack.map((tech, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="font-semibold text-sm">{tech.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{tech.category}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Flows */}
      <div>
        <h2 className="text-2xl font-bold mb-6">User Flows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Rocket className="h-6 w-6 text-blue-600" />
                <CardTitle>Startup Journey</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Sign up with Clerk authentication</li>
                <li>Complete startup profile onboarding</li>
                <li>Browse and search MUSC stakeholders</li>
                <li>Send connection requests</li>
                <li>Manage collaborations and meetings</li>
                <li>Track progress and outcomes</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-6 w-6 text-green-600" />
                <CardTitle>Stakeholder Journey</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Sign up with MUSC credentials</li>
                <li>Complete professional profile</li>
                <li>Browse startup ecosystem</li>
                <li>Respond to connection requests</li>
                <li>Offer resources and expertise</li>
                <li>Provide mentorship and guidance</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Database Schema Highlight */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Database Architecture</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-purple-600" />
              <span>Schema Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Core Tables</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• chs_hack_users (base user data)</li>
                  <li>• chs_hack_startups (startup profiles)</li>
                  <li>• chs_hack_stakeholders (stakeholder profiles)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Connections</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• chs_hack_connections (networking)</li>
                  <li>• Status tracking & outcomes</li>
                  <li>• AI match scoring ready</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Analytics</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• chs_hack_analytics (metrics)</li>
                  <li>• chs_hack_resource_tags (categorization)</li>
                  <li>• Indexed for performance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 