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
import { Card, CardContent } from '@/components/ui/card';
import { User, Building2, Mail, Globe, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactInfo {
  name: string;
  organization?: string;
  email?: string;
  contactEmail?: string;
  website?: string;
  location?: string;
  title?: string;
  department?: string;
  stakeholderType?: string;
  companyName?: string;
  stage?: string;
}

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: ContactInfo | null;
  userType: 'startup' | 'stakeholder';
  connectionId: string;
}

export default function MessagingModal({
  isOpen,
  onClose,
  contactInfo,
  userType,
  connectionId,
}: MessagingModalProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!contactInfo || !message.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          message: message.trim(),
          recipientType: userType === 'startup' ? 'stakeholder' : 'startup',
        }),
      });

      if (response.ok) {
        toast.success(`Message sent to ${contactInfo.name}!`);
        setMessage('');
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!contactInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message to {contactInfo.name} via notification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Information Card */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  {userType === 'startup' ? (
                    <User className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Building2 className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{contactInfo.name}</h3>

                  {contactInfo.organization && (
                    <p className="text-gray-600">
                      {contactInfo.organization}
                      {contactInfo.title && ` • ${contactInfo.title}`}
                      {contactInfo.department && ` • ${contactInfo.department}`}
                    </p>
                  )}

                  {contactInfo.companyName && (
                    <p className="text-gray-600">
                      {contactInfo.companyName}
                      {contactInfo.stage && ` • ${contactInfo.stage} stage`}
                    </p>
                  )}

                  {contactInfo.stakeholderType && (
                    <p className="text-gray-600 capitalize">
                      {contactInfo.stakeholderType.replace('_', ' ')}
                    </p>
                  )}

                  {/* Contact Details */}
                  <div className="space-y-2 pt-2">
                    {(contactInfo.email || contactInfo.contactEmail) && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{contactInfo.contactEmail || contactInfo.email}</span>
                      </div>
                    )}

                    {contactInfo.website && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a
                          href={contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {contactInfo.website}
                        </a>
                      </div>
                    )}

                    {contactInfo.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{contactInfo.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              This message will be sent as a real-time notification to {contactInfo.name}.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={isLoading || !message.trim()}>
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
