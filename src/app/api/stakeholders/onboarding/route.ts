import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, stakeholders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { identifyStakeholderWithKnock } from '@/lib/services/knock';
import { markProfileComplete } from '@/lib/services/profile-sync';

// Schema for the onboarding data (includes user fields)
const StakeholderOnboardingSchema = z.object({
  // User fields
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  userId: z.string(),
  // Stakeholder profile fields
  stakeholderType: z.enum([
    'cro',
    'financier',
    'consultant',
    'advisor',
    'investor',
    'service_provider',
    'musc_faculty',
    'other',
  ]),
  organizationName: z.string().min(1, 'Organization name is required').optional(),
  contactEmail: z.string().email('Please enter a valid email').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  servicesOffered: z.array(z.string()).optional(),
  therapeuticAreas: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  capabilities: z.string().max(1000, 'Capabilities must be 1000 characters or less').optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Clerk to get email and other details
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    console.log('Clerk user:', {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });

    const body = await request.json();
    console.log('Received stakeholder onboarding data:', body);

    // Validate the request body
    const validatedData = StakeholderOnboardingSchema.parse(body);
    console.log('Validated stakeholder onboarding data:', validatedData);

    // Check if user already exists in our database
    const existingUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

    let user;
    if (existingUser.length > 0) {
      // Update existing user
      user = existingUser[0];
      await db
        .update(users)
        .set({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          userType: 'stakeholder',
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, userId));
    } else {
      // Create new user with generated ID
      const newUserId = randomUUID();
      await db.insert(users).values({
        id: newUserId,
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        userType: 'stakeholder',
        profileComplete: false, // Will be set to true by markProfileComplete
      });

      // Get the created user
      const createdUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
      user = createdUsers[0];
    }

    // Check if stakeholder profile already exists
    const existingStakeholder = await db
      .select()
      .from(stakeholders)
      .where(eq(stakeholders.userId, user.id))
      .limit(1);

    // Prepare stakeholder data (exclude user fields)
    const stakeholderData = {
      stakeholderType: validatedData.stakeholderType,
      organizationName: validatedData.organizationName,
      contactEmail: validatedData.contactEmail,
      website: validatedData.website,
      location: validatedData.location,
      bio: validatedData.bio,
      servicesOffered: validatedData.servicesOffered,
      therapeuticAreas: validatedData.therapeuticAreas,
      industries: validatedData.industries,
      capabilities: validatedData.capabilities,
    };

    if (existingStakeholder.length > 0) {
      // Update existing stakeholder profile
      await db
        .update(stakeholders)
        .set({
          ...stakeholderData,
          updatedAt: new Date(),
        })
        .where(eq(stakeholders.userId, user.id));
    } else {
      // Create new stakeholder profile with generated ID
      await db.insert(stakeholders).values({
        id: randomUUID(),
        userId: user.id,
        ...stakeholderData,
      });
    }

    // Mark profile as complete in both Clerk and database
    await markProfileComplete(userId, 'stakeholder');
    console.log('Profile marked as complete');

    // Identify user with Knock after successful profile creation using Clerk ID
    await identifyStakeholderWithKnock(
      userId, // Use Clerk ID for consistency
      validatedData.firstName,
      validatedData.lastName,
      clerkUser.emailAddresses[0]?.emailAddress || '',
      validatedData.organizationName
    );

    return NextResponse.json({
      message: 'Stakeholder profile saved successfully!',
      userId: user.id,
    });
  } catch (error) {
    console.error('Error saving stakeholder profile:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to save stakeholder profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
