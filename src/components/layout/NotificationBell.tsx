'use client';

import React, { useState, useRef } from 'react';
import {
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
} from '@knocklabs/react';
import { useAuth } from '@clerk/nextjs';
import ToastProvider from './ToastProvider';

// Import Knock's CSS styles
import '@knocklabs/react/dist/index.css';

export default function NotificationBell() {
  const { isSignedIn } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Don't render if user is not signed in
  if (!isSignedIn) {
    return null;
  }

  return (
    <KnockFeedProvider feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID!}>
      <div className="relative">
        <NotificationIconButton ref={buttonRef} onClick={() => setIsVisible(!isVisible)} />
        <NotificationFeedPopover
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
          buttonRef={buttonRef}
        />
      </div>
      <ToastProvider />
    </KnockFeedProvider>
  );
}
