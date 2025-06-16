import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, startups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { startupOnboardingFormSchema } from '@/lib/db/schema-types';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting startup onboarding API call');

    const { userId } = await auth();
    console.log('Clerk userId:', userId);

    if (!userId) {
      console.log('No userId from auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user first to verify they exist and are a startup
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    console.log('Found user:', user ? { id: user.id, userType: user.userType } : 'not found');

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.userType !== 'startup') {
      console.log('User type is not startup:', user.userType);
      return NextResponse.json({ error: 'Access denied - not a startup user' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body keys:', Object.keys(body));
    console.log('Request body:', body);

    // Validate the form data using the complete form schema
    console.log('Starting validation');
    const validatedData = startupOnboardingFormSchema.parse(body);
    console.log('Validation successful');

    // Check if startup profile already exists
    const existingStartup = await db.query.startups.findFirst({
      where: eq(startups.userId, user.id),
    });
    console.log('Existing startup check:', existingStartup ? 'found' : 'not found');

    // Update user's first and last name
    console.log('Updating user name');
    await db
      .update(users)
      .set({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    console.log('User name updated');

    let startupResult;

    if (existingStartup) {
      console.log('Updating existing startup profile');
      // Update existing startup profile
      const updateData = {
        companyName: validatedData.companyName,
        description: validatedData.description,
        website: validatedData.website || null,
        stage: validatedData.stage,
        focusAreas: validatedData.focusAreas,
        productTypes: validatedData.productTypes,
        technologies: validatedData.technologies,
        regulatoryStatus: validatedData.regulatoryStatus || null,
        needsClinicalTrials: validatedData.needsClinicalTrials,
        nihFundingInterest: validatedData.nihFundingInterest || null,
        businessNeeds: validatedData.businessNeeds,
        keywords: validatedData.keywords,
        currentGoals: validatedData.currentGoals || null,
        currentNeeds: validatedData.currentNeeds || null,
        milestones: validatedData.milestones || null,
        fundingStatus: validatedData.fundingStatus || null,
        teamSize: validatedData.teamSize || null,
        location: validatedData.location || null,
        updatedAt: new Date(),
      };

      startupResult = await db
        .update(startups)
        .set(updateData)
        .where(eq(startups.id, existingStartup.id));
      console.log('Startup updated:', startupResult);
    } else {
      console.log('Creating new startup profile');
      // Create startup profile with only the startup-specific data
      const startupData = {
        id: crypto.randomUUID(),
        userId: user.id,
        companyName: validatedData.companyName,
        description: validatedData.description,
        website: validatedData.website || null,
        stage: validatedData.stage,
        focusAreas: validatedData.focusAreas,
        productTypes: validatedData.productTypes,
        technologies: validatedData.technologies,
        regulatoryStatus: validatedData.regulatoryStatus || null,
        needsClinicalTrials: validatedData.needsClinicalTrials,
        nihFundingInterest: validatedData.nihFundingInterest || null,
        businessNeeds: validatedData.businessNeeds,
        keywords: validatedData.keywords,
        currentGoals: validatedData.currentGoals || null,
        currentNeeds: validatedData.currentNeeds || null,
        milestones: validatedData.milestones || null,
        fundingStatus: validatedData.fundingStatus || null,
        teamSize: validatedData.teamSize || null,
        location: validatedData.location || null,
      };

      console.log('Creating startup with data keys:', Object.keys(startupData));
      startupResult = await db.insert(startups).values(startupData);
      console.log('Startup created:', startupResult);
    }

    // Update user profile completion status
    console.log('Updating profile completion status');
    await db
      .update(users)
      .set({
        profileComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    console.log('Profile completion updated');

    const response = {
      message: existingStartup
        ? 'Startup profile updated successfully'
        : 'Startup onboarding completed successfully',
      startupId: existingStartup?.id || startupResult.insertId,
      redirectTo: '/dashboard',
    };
    console.log('Returning success response:', response);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error processing startup onboarding:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    if (error instanceof Error && error.name === 'ZodError') {
      console.log('Validation error details:', error.message);
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
