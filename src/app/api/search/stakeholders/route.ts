import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, stakeholders } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { StakeholderSearchSchema } from '@/lib/validations';

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
    const department = searchParams.get('department');
    const expertiseArea = searchParams.get('expertiseArea');
    const availabilityStatus = searchParams.get('availabilityStatus');
    const mentorshipInterest = searchParams.get('mentorshipInterest');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 results per page

    // Validate search parameters
    const searchData = StakeholderSearchSchema.parse({
      query: query || undefined,
      department: department || undefined,
      expertiseArea: expertiseArea || undefined,
      availabilityStatus: availabilityStatus || undefined,
      mentorshipInterest: mentorshipInterest === 'true' ? true : undefined,
    });

    // Build query conditions
    const conditions = [];

    // Text search across name, title, department, and bio
    if (searchData.query) {
      conditions.push(
        sql`(
          ${users.firstName} LIKE ${`%${searchData.query}%`} OR 
          ${users.lastName} LIKE ${`%${searchData.query}%`} OR 
          ${stakeholders.title} LIKE ${`%${searchData.query}%`} OR 
          ${stakeholders.department} LIKE ${`%${searchData.query}%`} OR 
          ${stakeholders.bio} LIKE ${`%${searchData.query}%`}
        )`
      );
    }

    // Department filter
    if (searchData.department) {
      conditions.push(eq(stakeholders.department, searchData.department));
    }

    // Expertise area filter (JSON array contains)
    if (searchData.expertiseArea) {
      conditions.push(
        sql`JSON_CONTAINS(${stakeholders.expertiseAreas}, ${JSON.stringify([searchData.expertiseArea])})`
      );
    }

    // Availability status filter
    if (searchData.availabilityStatus) {
      conditions.push(eq(stakeholders.availabilityStatus, searchData.availabilityStatus));
    }

    // Mentorship interest filter
    if (searchData.mentorshipInterest !== undefined) {
      conditions.push(eq(stakeholders.mentorshipInterest, searchData.mentorshipInterest));
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Execute the search query
    const results = await db
      .select({
        id: stakeholders.id,
        userId: stakeholders.userId,
        title: stakeholders.title,
        department: stakeholders.department,
        specialties: stakeholders.specialties,
        expertiseAreas: stakeholders.expertiseAreas,
        availableResources: stakeholders.availableResources,
        collaborationInterests: stakeholders.collaborationInterests,
        researchInterests: stakeholders.researchInterests,
        availabilityStatus: stakeholders.availabilityStatus,
        mentorshipInterest: stakeholders.mentorshipInterest,
        bio: stakeholders.bio,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: stakeholders.createdAt,
      })
      .from(stakeholders)
      .innerJoin(users, eq(stakeholders.userId, users.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(stakeholders.createdAt);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(stakeholders)
      .innerJoin(users, eq(stakeholders.userId, users.id))
      .where(and(...conditions));

    const total = totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      stakeholders: results,
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
    console.error('Error searching stakeholders:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
