import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, startups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 20); // Max 20 results per page
    const offset = (page - 1) * limit;

    // Fetch startups with user information
    const companies = await db
      .select({
        id: startups.id,
        companyName: startups.companyName,
        description: startups.description,
        website: startups.website,
        stage: startups.stage,
        focusAreas: startups.focusAreas,
        fundingStatus: startups.fundingStatus,
        teamSize: startups.teamSize,
        location: startups.location,
        currentGoals: startups.currentGoals,
        currentNeeds: startups.currentNeeds,
        createdAt: startups.createdAt,
        // Include founder information
        founderFirstName: users.firstName,
        founderLastName: users.lastName,
        founderEmail: users.email,
      })
      .from(startups)
      .innerJoin(users, eq(startups.userId, users.id))
      .where(eq(users.profileComplete, true)) // Only show companies with complete profiles
      .limit(limit)
      .offset(offset)
      .orderBy(startups.createdAt);

    // Get total count for pagination
    const totalResults = await db
      .select({ count: startups.id })
      .from(startups)
      .innerJoin(users, eq(startups.userId, users.id))
      .where(eq(users.profileComplete, true));

    const total = totalResults.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
