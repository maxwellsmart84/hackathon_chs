'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Target,
  Loader2,
  Edit,
  Save,
  X,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import StakeholderOnboardingForm from '@/components/forms/StakeholderOnboardingForm';
import MessagingModal from '@/components/MessagingModal';
import { type StakeholderOnboardingFormData } from '@/components/forms/StakeholderOnboardingForm';
import { toast } from 'sonner';

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

interface StakeholderProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationName?: string;
  stakeholderType: string;
  contactEmail?: string;
  website?: string;
  location?: string;
  servicesOffered?: string[];
  therapeuticAreas?: string[];
  industries?: string[];
  capabilities?: string;
  bio?: string;
}

interface Connection {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message: string;
  response?: string;
  createdAt: string;
  startupId: string;
  startupName: string;
  startupStage: string;
  founderName: string;
  founderLastName: string;
  // Contact information for accepted connections
  founderEmail?: string;
  startupWebsite?: string;
  startupLocation?: string;
}

const STAKEHOLDER_TYPES = [
  { value: 'cro', label: 'Contract Research Organization (CRO)' },
  { value: 'financier', label: 'Investor/Financier' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'investor', label: 'Investor' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'other', label: 'Other' },
];

const SERVICE_TYPES = [
  'Clinical Trials',
  'Regulatory Consulting',
  'Funding',
  'Business Development',
  'Market Research',
  'Intellectual Property',
  'Manufacturing',
  'Quality Assurance',
  'Software Development',
  'Data Analysis',
  'Marketing',
  'Sales',
  'Legal Services',
  'Accounting',
  'Strategic Planning',
  'Mentorship',
];

const THERAPEUTIC_AREAS = [
  'Cardiology',
  'Oncology',
  'Neurology',
  'Orthopedics',
  'Dermatology',
  'Ophthalmology',
  'Endocrinology',
  'Gastroenterology',
  'Infectious Disease',
  'Respiratory',
  'Mental Health',
  'Pediatrics',
  'Geriatrics',
  "Women's Health",
  'Rare Diseases',
];

const INDUSTRIES = [
  'Medical Devices',
  'Pharmaceuticals',
  'Biotechnology',
  'Digital Health',
  'Diagnostics',
  'Surgical Instruments',
  'Healthcare IT',
  'Telemedicine',
  'AI/ML Healthcare',
  'Wearables',
];

export default function StakeholderDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StakeholderProfile | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<StakeholderProfile>>({});
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [messagingModal, setMessagingModal] = useState<{
    isOpen: boolean;
    connectionId: string;
    contactInfo: Connection | null;
  }>({
    isOpen: false,
    connectionId: '',
    contactInfo: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // First fetch user profile to check completion status
      const userResponse = await fetch('/api/users/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);

        // Only fetch dashboard data if profile is complete
        if (userData.user.profileComplete) {
          // Try to fetch stakeholder profile
          const profileResponse = await fetch('/api/stakeholders/me');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setProfile(profileData.stakeholder);
            setProfileForm(profileData.stakeholder);
          }

          // Fetch connections instead of companies
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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (data: StakeholderOnboardingFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/stakeholders/onboarding', {
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
          throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
        }
        throw new Error(errorData.error || `Server error (${response.status})`);
      }

      const result = await response.json();
      toast.success(result.message || 'Stakeholder profile saved successfully!');

      // Update user state to reflect completed profile
      setUser(prev => (prev ? { ...prev, profileComplete: true } : null));
      // Trigger header refresh
      window.dispatchEvent(new CustomEvent('user-profile-updated'));
      // Refresh dashboard data
      await fetchData();
    } catch (error) {
      console.error('Onboarding submission failed:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save stakeholder profile - unknown error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const method = profile ? 'PATCH' : 'POST';
      const response = await fetch('/api/stakeholders', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        await fetchData();
        setEditingProfile(false);
      } else {
        const error = await response.json();
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleService = (service: string) => {
    const current = profileForm.servicesOffered || [];
    const updated = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service];
    setProfileForm({ ...profileForm, servicesOffered: updated });
  };

  const toggleTherapeuticArea = (area: string) => {
    const current = profileForm.therapeuticAreas || [];
    const updated = current.includes(area) ? current.filter(a => a !== area) : [...current, area];
    setProfileForm({ ...profileForm, therapeuticAreas: updated });
  };

  const toggleIndustry = (industry: string) => {
    const current = profileForm.industries || [];
    const updated = current.includes(industry)
      ? current.filter(i => i !== industry)
      : [...current, industry];
    setProfileForm({ ...profileForm, industries: updated });
  };

  const handleConnectionResponse = async (
    connectionId: string,
    status: 'accepted' | 'declined'
  ) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          response: responseText,
        }),
      });

      if (response.ok) {
        toast.success(`Connection ${status === 'accepted' ? 'accepted' : 'declined'} successfully`);
        setRespondingTo(null);
        setResponseText('');
        // Refresh connections
        await fetchData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update connection');
      }
    } catch (error) {
      console.error('Error updating connection:', error);
      toast.error('Failed to update connection');
    }
  };

  const handleMessage = (connection: Connection) => {
    setMessagingModal({
      isOpen: true,
      connectionId: connection.id,
      contactInfo: connection,
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  // Show onboarding form for stakeholders who haven't completed their profile
  if (user.userType === 'stakeholder' && !user.profileComplete) {
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
        <StakeholderOnboardingForm
          onSubmit={handleOnboardingSubmit}
          isSubmitting={submitting}
          initialUserData={{
            firstName: user.firstName,
            lastName: user.lastName,
            userId: user.id,
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome{profile?.organizationName ? `, ${profile.organizationName}` : ''}
          </h1>
          <p className="text-gray-600">
            You&apos;re part of our stakeholder network. Manage your profile and discover startups
            that match your services.
          </p>
        </div>

        {/* Profile Completion Banner - removed since profile completion is now handled by user.profileComplete */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Section */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Profile</CardTitle>
              {profile && !editingProfile && (
                <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                // Profile Edit Form
                <div className="space-y-4">
                  <div>
                    <Label>Organization Name *</Label>
                    <Input
                      value={profileForm.organizationName || ''}
                      onChange={e =>
                        setProfileForm({ ...profileForm, organizationName: e.target.value })
                      }
                      placeholder="Your organization name"
                    />
                  </div>

                  <div>
                    <Label>Stakeholder Type *</Label>
                    <Select
                      value={profileForm.stakeholderType || ''}
                      onValueChange={value =>
                        setProfileForm({ ...profileForm, stakeholderType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAKEHOLDER_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={profileForm.contactEmail || ''}
                      onChange={e =>
                        setProfileForm({ ...profileForm, contactEmail: e.target.value })
                      }
                      placeholder="contact@yourorg.com"
                    />
                  </div>

                  <div>
                    <Label>Website</Label>
                    <Input
                      value={profileForm.website || ''}
                      onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      value={profileForm.location || ''}
                      onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="City, State/Country"
                    />
                  </div>

                  <div>
                    <Label>Services Offered</Label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {SERVICE_TYPES.map(service => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            checked={(profileForm.servicesOffered || []).includes(service)}
                            onCheckedChange={() => toggleService(service)}
                          />
                          <span className="text-sm">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Therapeutic Areas</Label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {THERAPEUTIC_AREAS.map(area => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            checked={(profileForm.therapeuticAreas || []).includes(area)}
                            onCheckedChange={() => toggleTherapeuticArea(area)}
                          />
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Industries Served</Label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {INDUSTRIES.map(industry => (
                        <div key={industry} className="flex items-center space-x-2">
                          <Checkbox
                            checked={(profileForm.industries || []).includes(industry)}
                            onCheckedChange={() => toggleIndustry(industry)}
                          />
                          <span className="text-sm">{industry}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Capabilities</Label>
                    <Textarea
                      value={profileForm.capabilities || ''}
                      onChange={e =>
                        setProfileForm({ ...profileForm, capabilities: e.target.value })
                      }
                      placeholder="Describe your capabilities and services..."
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleProfileSave} disabled={savingProfile} className="flex-1">
                      {savingProfile ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Profile
                    </Button>
                    {profile && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileForm(profile);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : profile ? (
                // Profile Display
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{profile.organizationName}</h3>
                    <p className="text-sm text-gray-600">
                      {STAKEHOLDER_TYPES.find(t => t.value === profile.stakeholderType)?.label}
                    </p>
                  </div>

                  {profile.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}

                  {profile.contactEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{profile.contactEmail}</span>
                    </div>
                  )}

                  {profile.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}

                  {profile.servicesOffered && profile.servicesOffered.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Services Offered</h4>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {profile.servicesOffered.map(service => (
                          <Badge key={service} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.therapeuticAreas && profile.therapeuticAreas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Therapeutic Areas</h4>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {profile.therapeuticAreas.map(area => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.capabilities && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Capabilities</h4>
                      <p className="mt-1 text-sm text-gray-600">{profile.capabilities}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600">Complete your profile to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Requests Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Connection Requests from Startups</CardTitle>
                <p className="text-sm text-gray-600">
                  Manage incoming connection requests from startups seeking your services
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.map(connection => (
                    <Card key={connection.id} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{connection.startupName}</h3>
                                {getStatusBadge(connection.status)}
                              </div>
                              <p className="text-sm text-gray-600">
                                Founded by {connection.founderName} {connection.founderLastName}
                              </p>
                              <div className="mt-1 flex items-center space-x-2">
                                <Target className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{connection.startupStage}</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(connection.createdAt)}
                            </span>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="mt-0.5 h-4 w-4 text-gray-500" />
                              <div className="flex-1">
                                <p className="text-sm">{connection.message}</p>
                              </div>
                            </div>
                          </div>

                          {connection.response && (
                            <div className="rounded-lg bg-blue-50 p-3">
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-900">
                                    Your response:
                                  </p>
                                  <p className="text-sm text-blue-800">{connection.response}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Contact Information for Accepted Connections */}
                          {connection.status === 'accepted' && (
                            <div className="rounded-lg bg-green-50 p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="mb-2 text-sm font-medium text-green-900">
                                    Contact Information
                                  </h4>
                                  <div className="space-y-1">
                                    {connection.founderEmail && (
                                      <div className="flex items-center space-x-2 text-sm text-green-800">
                                        <Mail className="h-4 w-4" />
                                        <span>{connection.founderEmail}</span>
                                      </div>
                                    )}
                                    {connection.startupWebsite && (
                                      <div className="flex items-center space-x-2 text-sm text-green-800">
                                        <Globe className="h-4 w-4" />
                                        <a
                                          href={connection.startupWebsite}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-600 hover:underline"
                                        >
                                          {connection.startupWebsite}
                                        </a>
                                      </div>
                                    )}
                                    {connection.startupLocation && (
                                      <div className="flex items-center space-x-2 text-sm text-green-800">
                                        <MapPin className="h-4 w-4" />
                                        <span>{connection.startupLocation}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMessage(connection)}
                                  className="border-green-300 bg-white text-green-700 hover:bg-green-50"
                                >
                                  Message
                                </Button>
                              </div>
                            </div>
                          )}

                          {connection.status === 'pending' && (
                            <div className="flex flex-col space-y-3">
                              {respondingTo === connection.id ? (
                                <div className="space-y-3">
                                  <Textarea
                                    placeholder="Write your response to this startup..."
                                    value={responseText}
                                    onChange={e => setResponseText(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() =>
                                        handleConnectionResponse(connection.id, 'accepted')
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Accept & Connect
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        handleConnectionResponse(connection.id, 'declined')
                                      }
                                    >
                                      Decline
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setRespondingTo(null);
                                        setResponseText('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => setRespondingTo(connection.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Respond
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {connections.length === 0 && (
                  <div className="py-8 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No connection requests yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      When startups reach out to you, their requests will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={messagingModal.isOpen}
        onClose={() =>
          setMessagingModal({
            isOpen: false,
            connectionId: '',
            contactInfo: null,
          })
        }
        contactInfo={
          messagingModal.contactInfo
            ? {
                name: `${messagingModal.contactInfo.founderName} ${messagingModal.contactInfo.founderLastName}`,
                companyName: messagingModal.contactInfo.startupName,
                stage: messagingModal.contactInfo.startupStage,
                email: messagingModal.contactInfo.founderEmail,
                website: messagingModal.contactInfo.startupWebsite,
                location: messagingModal.contactInfo.startupLocation,
              }
            : null
        }
        userType="stakeholder"
        connectionId={messagingModal.connectionId}
      />
    </div>
  );
}
