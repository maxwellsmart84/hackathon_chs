import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, stakeholders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user first to verify they exist and are a stakeholder
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.userType !== 'stakeholder') {
      return NextResponse.json(
        { error: 'Access denied - not a stakeholder user' },
        { status: 403 }
      );
    }

    // Get stakeholder profile
    const stakeholder = await db.query.stakeholders.findFirst({
      where: eq(stakeholders.userId, user.id),
    });

    if (!stakeholder) {
      return NextResponse.json(
        {
          error: 'Stakeholder profile not found',
          profileExists: false,
        },
        { status: 404 }
      );
    }

    // Return combined user and stakeholder data
    const profileData = {
      // User fields
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileComplete: user.profileComplete,
      // Stakeholder fields
      organizationName: stakeholder.organizationName,
      stakeholderType: stakeholder.stakeholderType,
      contactEmail: stakeholder.contactEmail,
      website: stakeholder.website,
      location: stakeholder.location,
      servicesOffered: stakeholder.servicesOffered,
      therapeuticAreas: stakeholder.therapeuticAreas,
      industries: stakeholder.industries,
      capabilities: stakeholder.capabilities,
      // Legacy fields (for MUSC stakeholders)
      title: stakeholder.title,
      department: stakeholder.department,
      specialties: stakeholder.specialties,
      expertiseAreas: stakeholder.expertiseAreas,
      availableResources: stakeholder.availableResources,
      collaborationInterests: stakeholder.collaborationInterests,
      researchInterests: stakeholder.researchInterests,
      availabilityStatus: stakeholder.availabilityStatus,
      mentorshipInterest: stakeholder.mentorshipInterest,
      bio: stakeholder.bio,
    };

    return NextResponse.json({ stakeholder: profileData });
  } catch (error) {
    console.error('Error fetching stakeholder profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
