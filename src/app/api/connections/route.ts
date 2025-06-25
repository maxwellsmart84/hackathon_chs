import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { connections, users, startups, stakeholders } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch connections for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to determine their type
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let userConnections;

    if (user.userType === 'startup') {
      // Get startup ID
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, user.id),
      });

      if (!startup) {
        return NextResponse.json({ error: 'Startup profile not found' }, { status: 404 });
      }

      // Fetch connections where this startup is involved
      userConnections = await db
        .select({
          id: connections.id,
          status: connections.status,
          message: connections.message,
          response: connections.response,
          aiMatchScore: connections.aiMatchScore,
          matchReasons: connections.matchReasons,
          meetingScheduled: connections.meetingScheduled,
          followUpCompleted: connections.followUpCompleted,
          connectionOutcome: connections.connectionOutcome,
          createdAt: connections.createdAt,
          // Stakeholder info
          stakeholderId: stakeholders.id,
          stakeholderName: users.firstName,
          stakeholderLastName: users.lastName,
          stakeholderTitle: stakeholders.title,
          stakeholderDepartment: stakeholders.department,
          stakeholderOrganization: stakeholders.organizationName,
          stakeholderType: stakeholders.stakeholderType,
        })
        .from(connections)
        .innerJoin(stakeholders, eq(stakeholders.id, connections.stakeholderId))
        .innerJoin(users, eq(users.id, stakeholders.userId))
        .where(eq(connections.startupId, startup.id));
    } else if (user.userType === 'stakeholder') {
      // Get stakeholder ID
      const stakeholder = await db.query.stakeholders.findFirst({
        where: eq(stakeholders.userId, user.id),
      });

      if (!stakeholder) {
        return NextResponse.json({ error: 'Stakeholder profile not found' }, { status: 404 });
      }

      // Fetch connections where this stakeholder is involved
      userConnections = await db
        .select({
          id: connections.id,
          status: connections.status,
          message: connections.message,
          response: connections.response,
          aiMatchScore: connections.aiMatchScore,
          matchReasons: connections.matchReasons,
          meetingScheduled: connections.meetingScheduled,
          followUpCompleted: connections.followUpCompleted,
          connectionOutcome: connections.connectionOutcome,
          createdAt: connections.createdAt,
          // Startup info
          startupId: startups.id,
          startupName: startups.companyName,
          startupStage: startups.stage,
          founderName: users.firstName,
          founderLastName: users.lastName,
        })
        .from(connections)
        .innerJoin(startups, eq(startups.id, connections.startupId))
        .innerJoin(users, eq(users.id, startups.userId))
        .where(eq(connections.stakeholderId, stakeholder.id));
    } else {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 403 });
    }

    return NextResponse.json({ connections: userConnections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new connection request
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stakeholderId, message } = await req.json();

    if (!stakeholderId) {
      return NextResponse.json({ error: 'Stakeholder ID is required' }, { status: 400 });
    }

    // Get user to verify they're a startup
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.userType !== 'startup') {
      return NextResponse.json(
        { error: 'Only startups can create connection requests' },
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

    // Create new connection
    const newConnection = await db.insert(connections).values({
      id: crypto.randomUUID(),
      startupId: startup.id,
      stakeholderId: stakeholderId,
      status: 'pending',
      initiatedBy: user.id,
      message: message || 'would like to connect with you for potential collaboration',
    });

    return NextResponse.json(
      {
        message: 'Connection request created successfully',
        connectionId: newConnection.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
