import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, startups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user first
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get startup profile
    const startup = await db.query.startups.findFirst({
      where: eq(startups.userId, user.id),
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup profile not found' }, { status: 404 });
    }

    // Return combined user and startup data
    const profileData = {
      // User fields
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      // Startup fields
      companyName: startup.companyName,
      description: startup.description,
      website: startup.website,
      stage: startup.stage,
      focusAreas: startup.focusAreas,
      productTypes: startup.productTypes,
      technologies: startup.technologies,
      regulatoryStatus: startup.regulatoryStatus,
      needsClinicalTrials: startup.needsClinicalTrials,
      nihFundingInterest: startup.nihFundingInterest,
      businessNeeds: startup.businessNeeds,
      keywords: startup.keywords,
      currentGoals: startup.currentGoals,
      currentNeeds: startup.currentNeeds,
      milestones: startup.milestones,
      fundingStatus: startup.fundingStatus,
      teamSize: startup.teamSize,
      location: startup.location,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching startup profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
