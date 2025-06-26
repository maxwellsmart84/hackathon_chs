import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { connections, users, stakeholders, startups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { identifyKnockUser } from '@/lib/services/knock';

interface SenderInfo {
  name: string;
  organization?: string;
  type: string;
}

interface RecipientInfo {
  name: string;
  organization?: string;
  type: string;
  stage?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId, message, recipientType } = await req.json();

    if (!connectionId || !message || !recipientType) {
      return NextResponse.json(
        { error: 'Connection ID, message, and recipient type are required' },
        { status: 400 }
      );
    }

    // Get the current user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the connection to verify it exists and user has access
    const connection = await db.query.connections.findFirst({
      where: eq(connections.id, connectionId),
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Verify the connection is accepted (can only message after connection is established)
    if (connection.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Can only send messages to accepted connections' },
        { status: 403 }
      );
    }

    // Get sender information based on user type
    let senderInfo: SenderInfo = { name: '', type: '' };
    let recipientClerkId: string = '';
    let recipientInfo: RecipientInfo = { name: '', type: '' };

    if (user.userType === 'startup') {
      // Get startup info
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, user.id),
      });

      if (!startup || connection.startupId !== startup.id) {
        return NextResponse.json(
          { error: 'You can only send messages for your own connections' },
          { status: 403 }
        );
      }

      senderInfo = {
        name: `${user.firstName} ${user.lastName}`,
        organization: startup.companyName || undefined,
        type: 'startup',
      };

      // Get stakeholder recipient info
      const stakeholder = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
          clerkId: users.clerkId,
          organizationName: stakeholders.organizationName,
          stakeholderType: stakeholders.stakeholderType,
        })
        .from(stakeholders)
        .innerJoin(users, eq(users.id, stakeholders.userId))
        .where(eq(stakeholders.id, connection.stakeholderId))
        .limit(1);

      if (!stakeholder.length) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }

      recipientClerkId = stakeholder[0].clerkId;
      recipientInfo = {
        name: `${stakeholder[0].firstName} ${stakeholder[0].lastName}`,
        organization: stakeholder[0].organizationName || undefined,
        type: stakeholder[0].stakeholderType,
      };
    } else if (user.userType === 'stakeholder') {
      // Get stakeholder info
      const stakeholder = await db.query.stakeholders.findFirst({
        where: eq(stakeholders.userId, user.id),
      });

      if (!stakeholder || connection.stakeholderId !== stakeholder.id) {
        return NextResponse.json(
          { error: 'You can only send messages for your own connections' },
          { status: 403 }
        );
      }

      senderInfo = {
        name: `${user.firstName} ${user.lastName}`,
        organization: stakeholder.organizationName || undefined,
        type: 'stakeholder',
      };

      // Get startup recipient info
      const startup = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
          clerkId: users.clerkId,
          companyName: startups.companyName,
          stage: startups.stage,
        })
        .from(startups)
        .innerJoin(users, eq(users.id, startups.userId))
        .where(eq(startups.id, connection.startupId))
        .limit(1);

      if (!startup.length) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }

      recipientClerkId = startup[0].clerkId;
      recipientInfo = {
        name: `${startup[0].firstName} ${startup[0].lastName}`,
        organization: startup[0].companyName,
        type: 'startup',
        stage: startup[0].stage,
      };
    } else {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 403 });
    }

    // Ensure both users are identified in Knock
    await identifyKnockUser({
      id: userId,
      name: senderInfo.name,
      email: user.email,
      company: senderInfo.organization,
      userType: user.userType,
    });

    await identifyKnockUser({
      id: recipientClerkId,
      name: recipientInfo.name,
      email: user.email, // We don't have recipient's email here, but Knock should already have it
      company: recipientInfo.organization,
      userType: recipientInfo.type === 'startup' ? 'startup' : 'stakeholder',
    });

    // Send message via Knock
    const knockResponse = await fetch(
      'https://api.knock.app/v1/workflows/startup-connection-request/trigger',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KNOCK_SECRET_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [recipientClerkId],
          data: {
            startupName:
              senderInfo.type === 'startup' ? senderInfo.organization : recipientInfo.organization,
            message: `💬 ${senderInfo.name}: ${message}`,
            requestorId: userId,
            stakeholderName:
              senderInfo.type === 'stakeholder' ? senderInfo.name : recipientInfo.name,
            stakeholderOrganization:
              senderInfo.type === 'stakeholder'
                ? senderInfo.organization
                : recipientInfo.organization,
            messageType: 'continuous_message',
            senderName: senderInfo.name,
            senderOrganization: senderInfo.organization,
          },
        }),
      }
    );

    if (!knockResponse.ok) {
      const errorData = await knockResponse.text();
      console.error('Knock API error:', knockResponse.status, errorData);
      return NextResponse.json(
        { error: `Failed to send message: ${knockResponse.status}` },
        { status: knockResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      {
        error: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
