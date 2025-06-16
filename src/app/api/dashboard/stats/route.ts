import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, connections, startups, stakeholders } from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to determine their role
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let stats;

    if (user.userType === 'startup') {
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, user.id),
      });

      if (!startup) {
        return NextResponse.json({ error: 'Startup profile not found' }, { status: 404 });
      }

      // Get startup stats
      const [totalConnections] = await db
        .select({ count: count() })
        .from(connections)
        .where(eq(connections.startupId, startup.id));

      const [activeConnections] = await db
        .select({ count: count() })
        .from(connections)
        .where(and(eq(connections.startupId, startup.id), eq(connections.status, 'accepted')));

      const [pendingRequests] = await db
        .select({ count: count() })
        .from(connections)
        .where(and(eq(connections.startupId, startup.id), eq(connections.status, 'pending')));

      // Calculate profile completeness
      let completenessScore = 0;
      const fields = [
        startup.description,
        startup.website,
        startup.stage,
        startup.focusAreas?.length,
        startup.productTypes?.length,
        startup.technologies?.length,
        startup.currentGoals?.length,
        startup.currentNeeds?.length,
        startup.fundingStatus,
        startup.teamSize,
        startup.location,
      ];

      const completedFields = fields.filter(field => field && field !== '').length;
      completenessScore = Math.round((completedFields / fields.length) * 100);

      stats = {
        userType: 'startup',
        totalConnections: totalConnections.count,
        activeConnections: activeConnections.count,
        pendingRequests: pendingRequests.count,
        profileViews: 0, // Would need to implement analytics tracking
        completenessScore,
        companyName: startup.companyName,
        stage: startup.stage,
        teamSize: startup.teamSize,
        location: startup.location,
        fundingStatus: startup.fundingStatus,
        focusAreas: startup.focusAreas,
        currentGoals: startup.currentGoals,
        currentNeeds: startup.currentNeeds,
      };
    } else if (user.userType === 'stakeholder') {
      const stakeholder = await db.query.stakeholders.findFirst({
        where: eq(stakeholders.userId, user.id),
      });

      if (!stakeholder) {
        return NextResponse.json({ error: 'Stakeholder profile not found' }, { status: 404 });
      }

      // Get stakeholder stats
      const [totalConnections] = await db
        .select({ count: count() })
        .from(connections)
        .where(eq(connections.stakeholderId, stakeholder.id));

      const [activeConnections] = await db
        .select({ count: count() })
        .from(connections)
        .where(
          and(eq(connections.stakeholderId, stakeholder.id), eq(connections.status, 'accepted'))
        );

      const [pendingRequests] = await db
        .select({ count: count() })
        .from(connections)
        .where(
          and(eq(connections.stakeholderId, stakeholder.id), eq(connections.status, 'pending'))
        );

      stats = {
        userType: 'stakeholder',
        totalConnections: totalConnections.count,
        activeConnections: activeConnections.count,
        pendingRequests: pendingRequests.count,
        title: stakeholder.title,
        department: stakeholder.department,
        specialties: stakeholder.specialties,
        expertiseAreas: stakeholder.expertiseAreas,
        availableResources: stakeholder.availableResources,
        collaborationInterests: stakeholder.collaborationInterests,
        availabilityStatus: stakeholder.availabilityStatus,
        mentorshipInterest: stakeholder.mentorshipInterest,
      };
    } else {
      // Admin stats - overall platform metrics
      const [totalUsers] = await db.select({ count: count() }).from(users);
      const [totalStartups] = await db.select({ count: count() }).from(startups);
      const [totalStakeholders] = await db.select({ count: count() }).from(stakeholders);
      const [totalConnections] = await db.select({ count: count() }).from(connections);

      stats = {
        userType: 'admin',
        totalUsers: totalUsers.count,
        totalStartups: totalStartups.count,
        totalStakeholders: totalStakeholders.count,
        totalConnections: totalConnections.count,
      };
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
