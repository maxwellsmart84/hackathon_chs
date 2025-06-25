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
  Plus,
  Loader2,
  Building2,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import StartupOnboardingForm from '@/components/forms/StartupOnboardingForm';
import { type StartupOnboardingFormData, type CreateStartup } from '@/lib/db/schema-types';
import NIHResearchSection from '@/components/dashboard/NIHResearchSection';
import ConnectionModal from '@/components/ConnectionModal';

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
  stakeholderId?: string;
  stakeholderName?: string;
  stakeholderLastName?: string;
  stakeholderTitle?: string;
  stakeholderDepartment?: string;
  stakeholderOrganization?: string;
  stakeholderType?: string;
  // For stakeholders - startup info
  startupId?: string;
  startupName?: string;
  startupStage?: string;
  founderName?: string;
  founderLastName?: string;
}

interface Stakeholder {
  id: string;
  stakeholderType: string;
  organizationName?: string;
  contactEmail?: string;
  website?: string;
  location?: string;
  servicesOffered?: string[];
  therapeuticAreas?: string[];
  industries?: string[];
  capabilities?: string;
  bio?: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

// Service types for filtering
const SERVICE_FILTER_OPTIONS = [
  { value: 'clinical-trials', label: 'Clinical Trials' },
  { value: 'regulatory-consulting', label: 'Regulatory Consulting' },
  { value: 'funding', label: 'Funding' },
  { value: 'business-development', label: 'Business Development' },
  { value: 'market-research', label: 'Market Research' },
  { value: 'intellectual-property', label: 'Intellectual Property' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'quality-assurance', label: 'Quality Assurance' },
  { value: 'software-development', label: 'Software Development' },
  { value: 'data-analysis', label: 'Data Analysis' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'legal-services', label: 'Legal Services' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'strategic-planning', label: 'Strategic Planning' },
  { value: 'mentorship', label: 'Mentorship' },
] as const;

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [selectedServiceFilters, setSelectedServiceFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startupData, setStartupData] = useState<CreateStartup | null>(null);
  const [connectionModal, setConnectionModal] = useState<{
    isOpen: boolean;
    stakeholder: Stakeholder | null;
  }>({ isOpen: false, stakeholder: null });

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

        // Redirect stakeholders to their specialized dashboard
        if (userData.user.userType === 'stakeholder') {
          window.location.href = '/dashboard/stakeholder';
          return;
        }

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

          // Fetch startup data for NIH research matching (only for startup users)
          if (userData.user.userType === 'startup') {
            const startupResponse = await fetch('/api/startups');
            if (startupResponse.ok) {
              const startupProfileData = await startupResponse.json();
              setStartupData(startupProfileData);
            }

            // Fetch stakeholders for matching
            const stakeholdersResponse = await fetch('/api/stakeholders?limit=6');
            if (stakeholdersResponse.ok) {
              const stakeholdersData = await stakeholdersResponse.json();
              setStakeholders(stakeholdersData.stakeholders || []);
            }
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
        // Trigger header refresh
        window.dispatchEvent(new CustomEvent('user-profile-updated'));
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

  // Helper function to check if a connection exists with a stakeholder
  const getConnectionStatus = (stakeholderId: string) => {
    return connections.find(connection => connection.stakeholderId === stakeholderId);
  };

  // Filter stakeholders based on selected service types
  const filteredStakeholders = stakeholders.filter(stakeholder => {
    if (selectedServiceFilters.length === 0) return true;

    return selectedServiceFilters.some(filter => stakeholder.servicesOffered?.includes(filter));
  });

  // Toggle filter selection
  const toggleServiceFilter = (serviceValue: string) => {
    setSelectedServiceFilters(prev =>
      prev.includes(serviceValue) ? prev.filter(s => s !== serviceValue) : [...prev, serviceValue]
    );
  };

  const clearAllFilters = () => {
    setSelectedServiceFilters([]);
  };

  const handleConnect = (stakeholder: Stakeholder) => {
    setConnectionModal({ isOpen: true, stakeholder });
  };

  const renderStartupDashboard = () => (
    <div className="space-y-6">
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

      {/* Service Type Filters */}
      {connections.length === 0 && stakeholders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filter Stakeholders by Services Needed</CardTitle>
              {selectedServiceFilters.length > 0 && (
                <Button size="sm" variant="outline" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SERVICE_FILTER_OPTIONS.map(service => (
                <Badge
                  key={service.value}
                  variant={selectedServiceFilters.includes(service.value) ? 'default' : 'outline'}
                  className="hover:bg-opacity-80 cursor-pointer px-3 py-1 text-sm"
                  onClick={() => toggleServiceFilter(service.value)}
                >
                  {service.label}
                </Badge>
              ))}
            </div>
            {selectedServiceFilters.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Showing stakeholders offering:{' '}
                {selectedServiceFilters
                  .map(
                    filter => SERVICE_FILTER_OPTIONS.find(option => option.value === filter)?.label
                  )
                  .join(', ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Connections */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Available Stakeholders</CardTitle>
              <Button size="sm" variant="outline">
                <Search className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStakeholders.length > 0 ? (
                filteredStakeholders.slice(0, 3).map(stakeholder => {
                  const existingConnection = getConnectionStatus(stakeholder.id);
                  return (
                    <div
                      key={stakeholder.id}
                      className="flex items-center space-x-4 rounded-lg border p-4"
                    >
                      <div className="rounded-lg bg-green-100 p-2">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">
                          {stakeholder.firstName} {stakeholder.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stakeholder.organizationName} •{' '}
                          {stakeholder.stakeholderType.replace('_', ' ')}
                        </p>
                        <div className="flex items-center space-x-2">
                          {existingConnection && (
                            <Badge
                              variant={
                                existingConnection.status === 'accepted'
                                  ? 'default'
                                  : existingConnection.status === 'pending'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="text-xs"
                            >
                              {existingConnection.status}
                            </Badge>
                          )}
                          {stakeholder.servicesOffered &&
                            stakeholder.servicesOffered.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {stakeholder.servicesOffered[0]}
                              </Badge>
                            )}
                          {stakeholder.servicesOffered &&
                            stakeholder.servicesOffered.length > 1 && (
                              <Badge variant="outline" className="text-xs">
                                +{stakeholder.servicesOffered.length - 1}
                              </Badge>
                            )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {stakeholder.website && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={stakeholder.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleConnect(stakeholder)}
                          disabled={!!existingConnection}
                        >
                          {existingConnection ? 'Connected' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {selectedServiceFilters.length > 0
                      ? 'No stakeholders found with selected services'
                      : 'No stakeholders available'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedServiceFilters.length > 0
                      ? 'Try adjusting your service filters or clearing them to see more options.'
                      : 'Check back later as more stakeholders join the platform.'}
                  </p>
                  <div className="mt-6">
                    {selectedServiceFilters.length > 0 ? (
                      <Button size="sm" onClick={clearAllFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Find Stakeholders
                      </Button>
                    )}
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

      {/* NIH Research & Collaboration Section */}
      {startupData && <NIHResearchSection startupData={startupData} />}
    </div>
  );

  const renderStakeholderDashboard = () => (
    <div className="space-y-6">
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
            <p className="text-muted-foreground text-xs">Hackathon experts</p>
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
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Content */}
        {userType === 'startup' && renderStartupDashboard()}
        {userType === 'stakeholder' && renderStakeholderDashboard()}
        {userType === 'admin' && renderAdminDashboard()}
      </main>

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={connectionModal.isOpen}
        onClose={() => setConnectionModal({ isOpen: false, stakeholder: null })}
        stakeholder={connectionModal.stakeholder}
        startupName={dashboardStats?.companyName}
        onConnectionSuccess={(stakeholderId: string) => {
          // Add new connection to local state without page refresh
          const newConnection = {
            id: crypto.randomUUID(),
            stakeholderId: stakeholderId,
            status: 'pending',
            aiMatchScore: undefined,
            matchReasons: undefined,
            meetingScheduled: false,
            followUpCompleted: false,
            createdAt: new Date().toISOString(),
            stakeholderName: connectionModal.stakeholder?.firstName,
            stakeholderLastName: connectionModal.stakeholder?.lastName,
            stakeholderTitle: undefined,
            stakeholderDepartment: undefined,
            stakeholderOrganization: connectionModal.stakeholder?.organizationName,
            stakeholderType: connectionModal.stakeholder?.stakeholderType,
          };
          setConnections(prev => [...prev, newConnection]);
        }}
      />

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
