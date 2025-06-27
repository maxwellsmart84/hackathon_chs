'use client';

import React, { useEffect, useState } from 'react';
import { Heart, Building2, UserCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';

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

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  // Refetch user data when Clerk auth state changes
  useEffect(() => {
    if (isLoaded) {
      fetchUserData();
    }
  }, [isSignedIn, isLoaded]);

  // Refetch user data when navigating between pages
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      fetchUserData();
    }
  }, [pathname, isSignedIn, isLoaded]);

  const fetchUserData = async () => {
    try {
      console.log('Header: Fetching user data...');
      const userResponse = await fetch('/api/users/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('Header: User data received:', userData.user);
        setUser(userData.user);

        // If startup user with complete profile, get company name
        if (userData.user.profileComplete && userData.user.userType === 'startup') {
          console.log('Header: Fetching company name for completed startup profile');
          const startupResponse = await fetch('/api/startups');
          if (startupResponse.ok) {
            const startupData = await startupResponse.json();
            console.log('Header: Company data received:', startupData);
            setCompanyName(startupData.companyName);
          }
        } else {
          console.log(
            'Header: Not fetching company name - profileComplete:',
            userData.user.profileComplete,
            'userType:',
            userData.user.userType
          );
          // Reset company name if not a startup or profile incomplete
          setCompanyName(null);
        }
      } else {
        console.log('Header: Failed to fetch user data, status:', userResponse.status);
        // User not found or signed out - reset everything
        setUser(null);
        setCompanyName(null);
      }
    } catch (error) {
      console.error('Header: Error fetching user data:', error);
      // Reset state on error (likely signed out)
      setUser(null);
      setCompanyName(null);
    } finally {
      setLoading(false);
    }
  };

  const getHeaderContent = () => {
    if (!user) {
      return {
        title: 'Hackathon Innovation Engine',
        subtitle: null,
        icon: Heart,
        iconBg: 'bg-green-600',
      };
    }

    if (!user.profileComplete) {
      return {
        title: 'Complete Your Profile',
        subtitle: 'Finish setting up your account to get started',
        icon: user.userType === 'startup' ? Building2 : UserCheck,
        iconBg: 'bg-blue-600',
      };
    }

    // Profile is complete - show personalized content based on user type
    switch (user.userType) {
      case 'startup':
        return {
          title: companyName || `Welcome back, ${user.firstName}`,
          subtitle: companyName ? 'MedTech Startup' : 'Startup Dashboard',
          icon: Building2,
          iconBg: 'bg-blue-600',
        };

      case 'stakeholder':
        return {
          title: `Welcome back, ${user.firstName}  ${user.lastName}`,
          subtitle: 'Hackathon Stakeholder',
          icon: UserCheck,
          iconBg: 'bg-green-600',
        };

      case 'admin':
        return {
          title: 'Hackathon Innovation Engine',
          subtitle: 'Administrator Dashboard',
          icon: Shield,
          iconBg: 'bg-purple-600',
        };

      default:
        return {
          title: 'Hackathon Innovation Engine',
          subtitle: null,
          icon: Heart,
          iconBg: 'bg-green-600',
        };
    }
  };

  const { title, subtitle, icon: Icon, iconBg } = getHeaderContent();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              {loading ? (
                <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
              ) : (
                <span className="text-xl font-bold text-gray-900">{title}</span>
              )}
              {loading ? (
                <div className="mt-1 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              ) : (
                subtitle && <span className="text-sm text-gray-600">{subtitle}</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
              </div>
            ) : user ? (
              <>
                {pathname === '/' && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <NotificationBell />
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: {
                        width: '2.5rem',
                        height: '2.5rem',
                      },
                    },
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
