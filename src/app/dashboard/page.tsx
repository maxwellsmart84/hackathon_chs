"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  Search,
  Filter,
  Plus,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import StartupOnboardingForm from "@/components/forms/StartupOnboardingForm";

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "startup" | "stakeholder" | "admin";
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (formData: {
    name: string;
    description: string;
    stage: string;
    focusAreas: string[];
    productTypes: string[];
    technologies: string[];
    regulatoryStatus?: string;
    needsClinicalTrials: boolean;
    nihFundingInterest?: string;
    businessNeeds?: string[];
    keywords?: string[];
  }) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/startups/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await response.json();
        // Update user state to reflect completed profile
        setUser(prev => prev ? { ...prev, profileComplete: true } : null);
        // Optionally redirect or show success message
        router.refresh(); // Refresh to show dashboard
      } else {
        const error = await response.json();
        console.error('Onboarding submission failed:', error);
        alert('Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <p className="text-gray-600">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  // Show onboarding form for startups who haven't completed their profile
  if (user.userType === "startup" && !user.profileComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        {submitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Completing your onboarding...</span>
            </div>
          </div>
        )}
        <StartupOnboardingForm onSubmit={handleOnboardingSubmit} />
      </div>
    );
  }

  const userType = user.userType;
  const userName = `${user.firstName} ${user.lastName}`;

  const renderStartupDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Awaiting responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Match Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Profile completeness</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Connections */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recommended Connections</CardTitle>
              <Button size="sm" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: "Dr. Sarah Johnson",
                title: "Cardiologist & Innovation Lead",
                department: "Cardiology",
                expertise: ["Medical Devices", "Clinical Trials"],
                matchScore: 92,
                reason: "Expertise in cardiac device development matches your focus area"
              },
              {
                name: "Dr. Michael Chen",
                title: "Director of Regulatory Affairs",
                department: "Technology Transfer",
                expertise: ["FDA Approval", "Regulatory Strategy"],
                matchScore: 88,
                reason: "Can help with regulatory pathway planning"
              },
              {
                name: "Dr. Lisa Rodriguez",
                title: "Senior Research Scientist",
                department: "Biomedical Informatics",
                expertise: ["Data Analysis", "AI/ML"],
                matchScore: 85,
                reason: "Your AI-powered diagnostics aligns with her research"
              }
            ].map((connection, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{connection.name}</h4>
                    <Badge variant="secondary">{connection.matchScore}% match</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{connection.title}</p>
                  <p className="text-sm text-gray-500">{connection.department}</p>
                  <div className="flex flex-wrap gap-1">
                    {connection.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600">{connection.reason}</p>
                </div>
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                type: "connection",
                message: "Dr. Amanda White accepted your connection request",
                time: "2 hours ago",
                status: "accepted"
              },
              {
                type: "view",
                message: "Your profile was viewed by 3 MUSC stakeholders",
                time: "1 day ago",
                status: "info"
              },
              {
                type: "message",
                message: "New message from Dr. James Wilson",
                time: "2 days ago",
                status: "pending"
              },
              {
                type: "match",
                message: "5 new potential matches available",
                time: "3 days ago",
                status: "info"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  activity.status === 'accepted' ? 'bg-green-500' :
                  activity.status === 'pending' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStakeholderDashboard = () => (
    <div className="space-y-6">
      {/* Stakeholder-specific content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">5 new this week</p>
          </CardContent>
        </Card>
        {/* Add more stakeholder-specific stats */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Interested Startups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Startups looking for your expertise will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Admin-specific analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Admin analytics and insights will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MI</span>
                </div>
                <span className="font-bold text-xl text-gray-900">MUSC Innovation Engine</span>
              </Link>
              <Badge variant="outline" className="capitalize">
                {userType}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {userType === 'startup' ? 'Find Experts' : 'Browse Startups'}
              </Button>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600">
            {userType === 'startup' && "Here&apos;s your innovation dashboard. Discover new connections and track your progress."}
            {userType === 'stakeholder' && "Manage your expertise profile and connect with innovative startups."}
            {userType === 'admin' && "Monitor platform performance and user engagement."}
          </p>
        </div>

        {/* Dashboard Content */}
        {userType === 'startup' && renderStartupDashboard()}
        {userType === 'stakeholder' && renderStakeholderDashboard()}
        {userType === 'admin' && renderAdminDashboard()}
      </main>
    </div>
  );
} 