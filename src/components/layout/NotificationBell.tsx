'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
  useKnockFeed,
} from '@knocklabs/react';
import { useAuth } from '@clerk/nextjs';
import ToastProvider from './ToastProvider';

// Import Knock's CSS styles
import '@knocklabs/react/dist/index.css';

function NotificationBellContent() {
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { feedClient } = useKnockFeed();

  // Calculate unread count from feed items
  const updateUnreadCount = useCallback(() => {
    if (!feedClient) return;

    feedClient
      .fetch()
      .then(response => {
        if (response && response.status === 'ok' && response.data) {
          const unseenCount = response.data.entries.filter(
            (item: { status: string }) => item.status === 'unseen'
          ).length;
          setUnreadCount(unseenCount);
        }
      })
      .catch(error => {
        console.error('Error fetching feed for unread count:', error);
      });
  }, [feedClient]);

  useEffect(() => {
    if (!feedClient) return;

    // Initial fetch
    updateUnreadCount();

    // Listen for real-time updates
    const onNotificationsReceived = () => {
      updateUnreadCount();
    };

    feedClient.on('items.received.realtime', onNotificationsReceived);

    return () => {
      feedClient.off('items.received.realtime', onNotificationsReceived);
    };
  }, [feedClient, updateUnreadCount]);

  const handleBellClick = () => {
    setIsVisible(!isVisible);
  };

  const handlePopoverClose = () => {
    setIsVisible(false);
    // Update count after closing (items may have been marked as seen)
    setTimeout(updateUnreadCount, 500);
  };

  return (
    <div className="relative">
      <div className="relative">
        <NotificationIconButton ref={buttonRef} onClick={handleBellClick} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      <NotificationFeedPopover
        isVisible={isVisible}
        onClose={handlePopoverClose}
        buttonRef={buttonRef}
      />
    </div>
  );
}

export default function NotificationBell() {
  const { isSignedIn } = useAuth();

  // Don't render if user is not signed in
  if (!isSignedIn) {
    return null;
  }

  return (
    <KnockFeedProvider feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID!}>
      <NotificationBellContent />
      <ToastProvider />
    </KnockFeedProvider>
  );
}
