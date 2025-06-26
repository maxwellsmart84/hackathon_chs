import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { connections, users, stakeholders, startups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { identifyKnockUser } from '@/lib/services/knock';

// PATCH - Update connection status (accept/decline)
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const connectionId = params.id;
    const { status, response } = await req.json();

    if (!status || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (accepted or declined)' },
        { status: 400 }
      );
    }

    // Get user to verify they're a stakeholder
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.userType !== 'stakeholder') {
      return NextResponse.json(
        { error: 'Only stakeholders can respond to connection requests' },
        { status: 403 }
      );
    }

    // Get stakeholder ID
    const stakeholder = await db.query.stakeholders.findFirst({
      where: eq(stakeholders.userId, user.id),
    });

    if (!stakeholder) {
      return NextResponse.json({ error: 'Stakeholder profile not found' }, { status: 404 });
    }

    // Verify the connection exists and belongs to this stakeholder
    const connection = await db.query.connections.findFirst({
      where: eq(connections.id, connectionId),
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.stakeholderId !== stakeholder.id) {
      return NextResponse.json(
        { error: 'You can only respond to your own connection requests' },
        { status: 403 }
      );
    }

    if (connection.status !== 'pending') {
      return NextResponse.json(
        { error: 'This connection request has already been responded to' },
        { status: 409 }
      );
    }

    // Get startup information for notification
    const startup = await db.query.startups.findFirst({
      where: eq(startups.id, connection.startupId),
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const startupUser = await db.query.users.findFirst({
      where: eq(users.id, startup.userId),
    });

    if (!startupUser) {
      return NextResponse.json({ error: 'Startup user not found' }, { status: 404 });
    }

    // Update the connection
    await db
      .update(connections)
      .set({
        status: status as 'accepted' | 'declined',
        response: response || null,
        updatedAt: new Date(),
      })
      .where(eq(connections.id, connectionId));

    // Send notification to startup about the response
    try {
      // Ensure startup user is identified in Knock
      await identifyKnockUser({
        id: startupUser.clerkId,
        name: `${startupUser.firstName} ${startupUser.lastName}`,
        email: startupUser.email,
        company: startup.companyName,
        userType: 'startup',
      });

      // Send notification via Knock
      const knockResponse = await fetch(
        'https://api.knock.app/v1/workflows/startup-connection-request/trigger',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.KNOCK_SECRET_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              startupName: startup.companyName,
              message: `${status === 'accepted' ? 'accepted' : 'declined'} your connection request${response ? `: "${response}"` : ''}`,
              stakeholderName: `${user.firstName} ${user.lastName}`,
              stakeholderOrganization: stakeholder.organizationName || 'Unknown Organization',
              requestorId: user.clerkId,
            },
            recipients: [startupUser.clerkId],
          }),
        }
      );

      if (!knockResponse.ok) {
        console.error('Failed to send notification to startup:', await knockResponse.text());
        // Don't fail the whole request if notification fails
      }
    } catch (error) {
      console.error('Error sending notification to startup:', error);
      // Don't fail the whole request if notification fails
    }

    return NextResponse.json({
      message: `Connection ${status} successfully`,
      connectionId,
    });
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
