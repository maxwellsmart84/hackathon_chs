'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Stakeholder {
  id: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  stakeholderType: string;
}

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stakeholder: Stakeholder | null;
  startupName?: string;
  onConnectionSuccess?: (stakeholderId: string) => void;
}

export default function ConnectionModal({
  isOpen,
  onClose,
  stakeholder,
  startupName,
  onConnectionSuccess,
}: ConnectionModalProps) {
  const [message, setMessage] = useState(
    'We would love to explore potential collaboration opportunities with your organization. Could we schedule a brief meeting to discuss how we might work together?'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!stakeholder) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stakeholderId: stakeholder.id,
          startupName: startupName || 'Your startup',
          message: message,
        }),
      });

      if (response.ok) {
        toast.success(
          `Connection request sent to ${stakeholder.firstName} ${stakeholder.lastName}!`
        );
        onConnectionSuccess?.(stakeholder.id); // Update local state with new connection
        onClose();
        setMessage(
          'We would love to explore potential collaboration opportunities with your organization. Could we schedule a brief meeting to discuss how we might work together?'
        );
      } else {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        toast.error('Failed to send connection request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!stakeholder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Connection Request</DialogTitle>
          <DialogDescription>
            Send a personalized message to connect with this stakeholder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stakeholder Info */}
          <div className="flex items-center space-x-3 rounded-lg border p-3">
            <div className="rounded-lg bg-green-100 p-2">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">
                {stakeholder.firstName} {stakeholder.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {stakeholder.organizationName} • {stakeholder.stakeholderType.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Your Company */}
          <div className="flex items-center space-x-3 rounded-lg border p-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{startupName || 'Your Startup'}</p>
              <p className="text-sm text-gray-500">Requesting connection</p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Write a personalized message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500">
              This message will be sent as a notification to the stakeholder.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isLoading || !message.trim()}>
              {isLoading ? 'Sending...' : 'Send Connection Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
