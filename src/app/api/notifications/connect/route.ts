import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { stakeholders, users, startups, connections } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stakeholderId, startupName, message } = await req.json();

    if (!stakeholderId) {
      return NextResponse.json({ error: 'Stakeholder ID is required' }, { status: 400 });
    }

    // Get the current user to determine their startup
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.userType !== 'startup') {
      return NextResponse.json(
        { error: 'Only startups can send connection requests' },
        { status: 403 }
      );
    }

    // Get startup ID
    const startup = await db.query.startups.findFirst({
      where: eq(startups.userId, user.id),
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup profile not found' }, { status: 404 });
    }

    // Fetch stakeholder details to get their organization name
    const stakeholder = await db
      .select({
        organizationName: stakeholders.organizationName,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(stakeholders)
      .innerJoin(users, eq(users.id, stakeholders.userId))
      .where(eq(stakeholders.id, stakeholderId))
      .limit(1);

    if (!stakeholder.length) {
      return NextResponse.json({ error: 'Stakeholder not found' }, { status: 404 });
    }

    const stakeholderData = stakeholder[0];

    // Check if connection already exists
    const existingConnection = await db.query.connections.findFirst({
      where: and(
        eq(connections.startupId, startup.id),
        eq(connections.stakeholderId, stakeholderId)
      ),
    });

    if (existingConnection) {
      return NextResponse.json(
        {
          error: 'Connection request already exists',
          connection: existingConnection,
        },
        { status: 409 }
      );
    }

    // Create connection record before sending notification
    const newConnection = await db.insert(connections).values({
      id: crypto.randomUUID(),
      startupId: startup.id,
      stakeholderId: stakeholderId,
      status: 'pending',
      initiatedBy: user.id,
      message: message || 'would like to connect with you for potential collaboration',
    });

    // Check if environment variables are set
    if (!process.env.KNOCK_SECRET_API_KEY) {
      console.error('KNOCK_SECRET_API_KEY is not set');
      return NextResponse.json({ error: 'Knock API key not configured' }, { status: 500 });
    }

    // Send notification via Knock REST API
    const response = await fetch(
      'https://api.knock.app/v1/workflows/startup-connection-request/trigger',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KNOCK_SECRET_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [stakeholderId],
          data: {
            startupName: startupName || 'A startup',
            message: message || 'wants to connect with you',
            requestorId: userId,
            stakeholderName: `${stakeholderData.firstName} ${stakeholderData.lastName}`,
            stakeholderOrganization: stakeholderData.organizationName || 'their organization',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Knock API error:', response.status, errorData);
      return NextResponse.json(
        { error: `Knock API error: ${response.status} - ${errorData}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      connectionId: newConnection.insertId,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      {
        error: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
