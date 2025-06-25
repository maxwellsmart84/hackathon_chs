'use client';

import React, { ReactNode } from 'react';
import { KnockProvider } from '@knocklabs/react';
import { useAuth } from '@clerk/nextjs';

interface KnockWrapperProps {
  children: ReactNode;
}

export default function KnockWrapper({ children }: KnockWrapperProps) {
  const { userId, isSignedIn } = useAuth();

  if (!isSignedIn || !userId) {
    return <>{children}</>;
  }

  return (
    <KnockProvider apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY!} userId={userId}>
      {children}
    </KnockProvider>
  );
}
