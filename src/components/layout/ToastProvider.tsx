'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useKnockFeed } from '@knocklabs/react';
import { useAuth } from '@clerk/nextjs';

export default function ToastProvider() {
  const { isSignedIn } = useAuth();
  const { feedClient } = useKnockFeed();

  useEffect(() => {
    if (!isSignedIn || !feedClient) return;

    const onNotificationsReceived = ({ items }: { items: any[] }) => {
      // Only show toast for new notifications (not when loading existing ones)
      const newNotifications = items.filter(
        (item: any) => item.__cursor && Date.now() - new Date(item.inserted_at).getTime() < 5000
      );

      newNotifications.forEach((notification: any) => {
        toast.success(
          `New notification: ${notification.data?.startupName || 'Someone'} wants to connect!`,
          {
            duration: 4000,
            icon: '🔔',
          }
        );
      });
    };

    // Listen for new notifications
    feedClient.on('items.received.realtime', onNotificationsReceived);

    return () => {
      feedClient.off('items.received.realtime', onNotificationsReceived);
    };
  }, [feedClient, isSignedIn]);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
