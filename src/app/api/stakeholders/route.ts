import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, stakeholders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { StakeholderProfileSchema, PartialStakeholderProfileSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user first to verify they exist
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle different behaviors based on user type
    if (user.userType === 'stakeholder') {
      // Stakeholder accessing their own profile
      const stakeholder = await db.query.stakeholders.findFirst({
        where: eq(stakeholders.userId, user.id),
      });

      if (!stakeholder) {
        return NextResponse.json({ error: 'Stakeholder profile not found' }, { status: 404 });
      }

      return NextResponse.json({ stakeholder });
    } else if (user.userType === 'startup') {
      // Startup accessing list of stakeholders
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const page = parseInt(url.searchParams.get('page') || '1');
      const offset = (page - 1) * limit;

      // Get all stakeholders for startups to browse
      const allStakeholders = await db
        .select({
          id: stakeholders.id,
          stakeholderType: stakeholders.stakeholderType,
          organizationName: stakeholders.organizationName,
          contactEmail: stakeholders.contactEmail,
          website: stakeholders.website,
          location: stakeholders.location,
          servicesOffered: stakeholders.servicesOffered,
          therapeuticAreas: stakeholders.therapeuticAreas,
          industries: stakeholders.industries,
          capabilities: stakeholders.capabilities,
          bio: stakeholders.bio,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          createdAt: stakeholders.createdAt,
        })
        .from(stakeholders)
        .innerJoin(users, eq(users.id, stakeholders.userId))
        .limit(limit)
        .offset(offset);

      return NextResponse.json({ stakeholders: allStakeholders });
    } else {
      return NextResponse.json({ error: 'Access denied - invalid user type' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error fetching stakeholder(s):', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate the stakeholder profile data
    const validatedData = StakeholderProfileSchema.parse(body);

    // Check if stakeholder profile already exists
    const existingStakeholder = await db.query.stakeholders.findFirst({
      where: eq(stakeholders.userId, user.id),
    });

    if (existingStakeholder) {
      return NextResponse.json({ error: 'Stakeholder profile already exists' }, { status: 409 });
    }

    // Create stakeholder profile with the new schema
    const newStakeholder = await db.insert(stakeholders).values({
      id: crypto.randomUUID(),
      userId: user.id,
      stakeholderType: validatedData.stakeholderType,
      organizationName: validatedData.organizationName || null,
      contactEmail: validatedData.contactEmail || null,
      website: validatedData.website || null,
      location: validatedData.location || null,
      servicesOffered: validatedData.servicesOffered || null,
      therapeuticAreas: validatedData.therapeuticAreas || null,
      industries: validatedData.industries || null,
      capabilities: validatedData.capabilities || null,
      title: validatedData.title || null,
      department: validatedData.department || null,
      specialties: validatedData.specialties || null,
      expertiseAreas: validatedData.expertiseAreas || null,
      availableResources: validatedData.availableResources || null,
      collaborationInterests: validatedData.collaborationInterests || null,
      researchInterests: validatedData.researchInterests || null,
      availabilityStatus: validatedData.availabilityStatus,
      mentorshipInterest: validatedData.mentorshipInterest,
      bio: validatedData.bio || null,
    });

    // Update user profile completion status
    await db
      .update(users)
      .set({
        profileComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      {
        message: 'Stakeholder profile created successfully',
        stakeholderId: newStakeholder.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stakeholder profile:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    // Validate the updated data
    const validatedData = PartialStakeholderProfileSchema.parse(body);

    // Update stakeholder profile with new schema fields
    await db
      .update(stakeholders)
      .set({
        ...(validatedData.stakeholderType && { stakeholderType: validatedData.stakeholderType }),
        ...(validatedData.organizationName !== undefined && {
          organizationName: validatedData.organizationName || null,
        }),
        ...(validatedData.contactEmail !== undefined && {
          contactEmail: validatedData.contactEmail || null,
        }),
        ...(validatedData.website !== undefined && { website: validatedData.website || null }),
        ...(validatedData.location !== undefined && { location: validatedData.location || null }),
        ...(validatedData.servicesOffered !== undefined && {
          servicesOffered: validatedData.servicesOffered || null,
        }),
        ...(validatedData.therapeuticAreas !== undefined && {
          therapeuticAreas: validatedData.therapeuticAreas || null,
        }),
        ...(validatedData.industries !== undefined && {
          industries: validatedData.industries || null,
        }),
        ...(validatedData.capabilities !== undefined && {
          capabilities: validatedData.capabilities || null,
        }),
        ...(validatedData.title !== undefined && { title: validatedData.title || null }),
        ...(validatedData.department !== undefined && {
          department: validatedData.department || null,
        }),
        ...(validatedData.specialties !== undefined && {
          specialties: validatedData.specialties || null,
        }),
        ...(validatedData.expertiseAreas !== undefined && {
          expertiseAreas: validatedData.expertiseAreas || null,
        }),
        ...(validatedData.availableResources !== undefined && {
          availableResources: validatedData.availableResources || null,
        }),
        ...(validatedData.collaborationInterests !== undefined && {
          collaborationInterests: validatedData.collaborationInterests || null,
        }),
        ...(validatedData.researchInterests !== undefined && {
          researchInterests: validatedData.researchInterests || null,
        }),
        ...(validatedData.availabilityStatus !== undefined && {
          availabilityStatus: validatedData.availabilityStatus,
        }),
        ...(validatedData.mentorshipInterest !== undefined && {
          mentorshipInterest: validatedData.mentorshipInterest,
        }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio || null }),
        updatedAt: new Date(),
      })
      .where(eq(stakeholders.userId, user.id));

    return NextResponse.json({ message: 'Stakeholder profile updated successfully' });
  } catch (error) {
    console.error('Error updating stakeholder profile:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
