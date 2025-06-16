'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  TrendingUp,
  Clock,
  MessageSquare,
  Search,
  Filter,
  Plus,
  Loader2,
  Building2,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import StartupOnboardingForm from '@/components/forms/StartupOnboardingForm';
import { type StartupOnboardingFormData } from '@/lib/db/schema-types';
import PageHeader from '@/components/layout/PageHeader';

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'startup' | 'stakeholder' | 'admin';
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  userType: 'startup' | 'stakeholder' | 'admin';
  totalConnections: number;
  activeConnections: number;
  pendingRequests: number;
  profileViews?: number;
  completenessScore?: number;
  // Startup specific
  companyName?: string;
  stage?: string;
  teamSize?: number;
  location?: string;
  fundingStatus?: string;
  focusAreas?: string[];
  currentGoals?: string[];
  currentNeeds?: string[];
  // Stakeholder specific
  title?: string;
  department?: string;
  specialties?: string[];
  expertiseAreas?: string[];
  availableResources?: string[];
  collaborationInterests?: string[];
  availabilityStatus?: string;
  mentorshipInterest?: boolean;
  // Admin specific
  totalUsers?: number;
  totalStartups?: number;
  totalStakeholders?: number;
}

interface Connection {
  id: string;
  status: string;
  aiMatchScore?: number;
  matchReasons?: string[];
  meetingScheduled: boolean;
  followUpCompleted: boolean;
  createdAt: string;
  // For startups - stakeholder info
  stakeholderName?: string;
  stakeholderTitle?: string;
  stakeholderDepartment?: string;
  // For stakeholders - startup info
  startupName?: string;
  startupStage?: string;
  founderName?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile
      const userResponse = await fetch('/api/users/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);

        // Only fetch dashboard stats and connections if profile is complete
        if (userData.user.profileComplete) {
          // Fetch dashboard stats
          const statsResponse = await fetch('/api/dashboard/stats');
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setDashboardStats(statsData.stats);
          }

          // Fetch connections
          const connectionsResponse = await fetch('/api/connections');
          if (connectionsResponse.ok) {
            const connectionsData = await connectionsResponse.json();
            setConnections(connectionsData.connections || []);
          }
        }
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (formData: StartupOnboardingFormData) => {
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
        setUser(prev => (prev ? { ...prev, profileComplete: true } : null));
        // Refresh dashboard data
        await fetchDashboardData();
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">User not found</h1>
          <p className="text-gray-600">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  // Show onboarding form for startups who haven't completed their profile
  if (user.userType === 'startup' && !user.profileComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        {submitting && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex items-center space-x-3 rounded-lg bg-white p-6">
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

  const renderStartupDashboard = () => (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${dashboardStats?.companyName || 'Startup'}`}
        description={`Manage your ${dashboardStats?.stage || 'startup'} connections and opportunities`}
        icon={Building2}
      />
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeConnections || 0}</div>
            <p className="text-muted-foreground text-xs">
              {dashboardStats?.totalConnections || 0} total connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.pendingRequests || 0}</div>
            <p className="text-muted-foreground text-xs">Awaiting responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.teamSize || 'N/A'}</div>
            <p className="text-muted-foreground text-xs">
              {dashboardStats?.location || 'Location not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Score</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.completenessScore || 0}%</div>
            <p className="text-muted-foreground text-xs">Profile completeness</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Connections */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Connections</CardTitle>
              <Button size="sm" variant="outline">
                <Search className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connections.length > 0 ? (
                connections.slice(0, 3).map(connection => (
                  <div
                    key={connection.id}
                    className="flex items-center space-x-4 rounded-lg border p-4"
                  >
                    <div className="rounded-lg bg-blue-100 p-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{connection.stakeholderName}</p>
                      <p className="text-sm text-gray-500">
                        {connection.stakeholderTitle} • {connection.stakeholderDepartment}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            connection.status === 'accepted'
                              ? 'default'
                              : connection.status === 'pending'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {connection.status}
                        </Badge>
                        {connection.aiMatchScore && (
                          <Badge variant="outline">{connection.aiMatchScore}% match</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start connecting with stakeholders to grow your network.
                  </p>
                  <div className="mt-6">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Find Stakeholders
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Stage</h4>
              <p className="text-sm text-gray-600 capitalize">
                {dashboardStats?.stage || 'Not specified'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Funding Status</h4>
              <p className="text-sm text-gray-600">
                {dashboardStats?.fundingStatus || 'Not specified'}
              </p>
            </div>

            {dashboardStats?.focusAreas && dashboardStats.focusAreas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Focus Areas</h4>
                <div className="mt-1 flex flex-wrap gap-1">
                  {dashboardStats.focusAreas.slice(0, 3).map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {dashboardStats.focusAreas.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{dashboardStats.focusAreas.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {dashboardStats?.currentGoals && dashboardStats.currentGoals.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Current Goals</h4>
                <div className="mt-1 space-y-1">
                  {dashboardStats.currentGoals.slice(0, 2).map((goal, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      • {goal}
                    </p>
                  ))}
                  {dashboardStats.currentGoals.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{dashboardStats.currentGoals.length - 2} more goals
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Link href="/dashboard/profile/edit">
                <Button variant="outline" className="w-full">
                  <Building2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStakeholderDashboard = () => (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, Dr. ${user.lastName}`}
        description={`${dashboardStats?.title || 'Stakeholder'} • ${dashboardStats?.department || 'Department'}`}
        icon={UserCheck}
      />

      {/* Stakeholder Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Requests</CardTitle>
            <MessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.pendingRequests || 0}</div>
            <p className="text-muted-foreground text-xs">Pending responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeConnections || 0}</div>
            <p className="text-muted-foreground text-xs">Connected startups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {dashboardStats?.availabilityStatus || 'Available'}
            </div>
            <p className="text-muted-foreground text-xs">Current status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorship</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.mentorshipInterest ? 'Yes' : 'No'}
            </div>
            <p className="text-muted-foreground text-xs">Offering mentorship</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Connections */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Startup Connections</CardTitle>
              <Button size="sm" variant="outline">
                <Search className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connections.length > 0 ? (
                connections.slice(0, 3).map(connection => (
                  <div
                    key={connection.id}
                    className="flex items-center space-x-4 rounded-lg border p-4"
                  >
                    <div className="rounded-lg bg-green-100 p-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{connection.startupName}</p>
                      <p className="text-sm text-gray-500">
                        {connection.founderName} • {connection.startupStage}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            connection.status === 'accepted'
                              ? 'default'
                              : connection.status === 'pending'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {connection.status}
                        </Badge>
                        {connection.aiMatchScore && (
                          <Badge variant="outline">{connection.aiMatchScore}% match</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start connecting with innovative startups.
                  </p>
                  <div className="mt-6">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Browse Startups
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expertise Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Your Expertise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Department</h4>
              <p className="text-sm text-gray-600">
                {dashboardStats?.department || 'Not specified'}
              </p>
            </div>

            {dashboardStats?.specialties && dashboardStats.specialties.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Specialties</h4>
                <div className="mt-1 flex flex-wrap gap-1">
                  {dashboardStats.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {dashboardStats.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{dashboardStats.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {dashboardStats?.expertiseAreas && dashboardStats.expertiseAreas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Expertise Areas</h4>
                <div className="mt-1 space-y-1">
                  {dashboardStats.expertiseAreas.slice(0, 3).map((area, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      • {area}
                    </p>
                  ))}
                  {dashboardStats.expertiseAreas.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{dashboardStats.expertiseAreas.length - 3} more areas
                    </p>
                  )}
                </div>
              </div>
            )}

            {dashboardStats?.availableResources && dashboardStats.availableResources.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Available Resources</h4>
                <div className="mt-1 space-y-1">
                  {dashboardStats.availableResources.slice(0, 2).map((resource, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      • {resource}
                    </p>
                  ))}
                  {dashboardStats.availableResources.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{dashboardStats.availableResources.length - 2} more resources
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Link href="/dashboard/profile/edit">
                <Button variant="outline" className="w-full">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Monitor platform performance and user engagement"
        icon={TrendingUp}
      />

      {/* Platform Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
            <p className="text-muted-foreground text-xs">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startups</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalStartups || 0}</div>
            <p className="text-muted-foreground text-xs">Active startups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stakeholders</CardTitle>
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalStakeholders || 0}</div>
            <p className="text-muted-foreground text-xs">MUSC experts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <MessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalConnections || 0}</div>
            <p className="text-muted-foreground text-xs">Total connections made</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Registration Rate</span>
                <span className="text-sm font-medium">Growing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connection Success Rate</span>
                <span className="text-sm font-medium">
                  {dashboardStats?.totalConnections && dashboardStats.totalConnections > 0
                    ? '85%'
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Engagement</span>
                <span className="text-sm font-medium">High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Status</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <Badge variant="default">Good</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Uptime</span>
                <Badge variant="default">99.9%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
                  <span className="text-sm font-bold text-white">MI</span>
                </div>
                <span className="text-xl font-bold text-gray-900">MUSC Innovation Engine</span>
              </Link>
              <Badge variant="outline" className="capitalize">
                {userType}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {userType === 'startup' ? 'Find Experts' : 'Browse Startups'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Content */}
        {userType === 'startup' && renderStartupDashboard()}
        {userType === 'stakeholder' && renderStakeholderDashboard()}
        {userType === 'admin' && renderAdminDashboard()}
      </main>

      {/* Botpress Chat Scripts */}
      <Script
        src="https://cdn.botpress.cloud/webchat/v3.0/inject.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Load the configuration script after the injection script is ready
          const configScript = document.createElement('script');
          configScript.src =
            'https://files.bpcontent.cloud/2025/06/04/21/20250604214818-NK7TCBZJ.js';
          configScript.async = true;
          document.head.appendChild(configScript);
        }}
      />
    </div>
  );
}
