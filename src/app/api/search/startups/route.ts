import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, startups } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { StartupSearchSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user exists (can be any authenticated user type)
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse search parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const focusArea = searchParams.get('focusArea');
    const stage = searchParams.get('stage');
    const fundingStatus = searchParams.get('fundingStatus');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 results per page

    // Validate search parameters
    const searchData = StartupSearchSchema.parse({
      query: query || undefined,
      focusArea: focusArea || undefined,
      stage: stage || undefined,
      fundingStatus: fundingStatus || undefined,
      location: location || undefined,
    });

    // Build query conditions
    const conditions = [];

    // Text search across company name, description, and goals/needs
    if (searchData.query) {
      conditions.push(
        sql`(
          ${startups.companyName} LIKE ${`%${searchData.query}%`} OR 
          ${startups.description} LIKE ${`%${searchData.query}%`} OR 
          ${startups.location} LIKE ${`%${searchData.query}%`}
        )`
      );
    }

    // Focus area filter - using JSON_CONTAINS for array field
    if (searchData.focusArea) {
      conditions.push(
        sql`JSON_CONTAINS(${startups.focusAreas}, ${JSON.stringify([searchData.focusArea])})`
      );
    }

    // Stage filter
    if (searchData.stage) {
      conditions.push(eq(startups.stage, searchData.stage));
    }

    // Funding status filter
    if (searchData.fundingStatus) {
      conditions.push(eq(startups.fundingStatus, searchData.fundingStatus));
    }

    // Location filter
    if (searchData.location) {
      conditions.push(sql`${startups.location} LIKE ${`%${searchData.location}%`}`);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Execute the search query
    const results = await db
      .select({
        id: startups.id,
        userId: startups.userId,
        companyName: startups.companyName,
        description: startups.description,
        website: startups.website,
        focusAreas: startups.focusAreas,
        stage: startups.stage,
        currentGoals: startups.currentGoals,
        currentNeeds: startups.currentNeeds,
        milestones: startups.milestones,
        fundingStatus: startups.fundingStatus,
        teamSize: startups.teamSize,
        location: startups.location,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: startups.createdAt,
      })
      .from(startups)
      .innerJoin(users, eq(startups.userId, users.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(startups.createdAt);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(startups)
      .innerJoin(users, eq(startups.userId, users.id))
      .where(and(...conditions));

    const total = totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      startups: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error searching startups:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
