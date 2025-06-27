import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, stakeholders, startups } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Ensures a user's profileComplete status is synced between Clerk metadata and our database.
 * If actual startup/stakeholder profiles exist, they take precedence over Clerk metadata.
 */
export async function syncUserProfileStatus(clerkUserId: string): Promise<{
  profileComplete: boolean;
  userType: 'startup' | 'stakeholder' | 'admin';
  wasUpdated: boolean;
}> {
  try {
    // Get Clerk user and metadata
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const metadata = clerkUser.publicMetadata as {
      userType?: string;
      onboardingComplete?: boolean;
    };

    const clerkComplete = metadata.onboardingComplete || false;
    const clerkUserType = (metadata.userType as 'startup' | 'stakeholder' | 'admin') || 'startup';

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (!user) {
      // User doesn't exist in database yet - this is handled elsewhere
      return {
        profileComplete: clerkComplete,
        userType: clerkUserType,
        wasUpdated: false,
      };
    }

    // Check for actual profile records - these are the source of truth
    const stakeholderProfile = await db.query.stakeholders.findFirst({
      where: eq(stakeholders.userId, user.id),
    });

    const startupProfile = await db.query.startups.findFirst({
      where: eq(startups.userId, user.id),
    });

    // Determine actual status based on profile existence
    let actualUserType: 'startup' | 'stakeholder' | 'admin';
    let actualProfileComplete: boolean;

    if (stakeholderProfile) {
      // Has stakeholder profile = definitely completed stakeholder onboarding
      actualUserType = 'stakeholder';
      actualProfileComplete = true;
    } else if (startupProfile) {
      // Has startup profile = definitely completed startup onboarding
      actualUserType = 'startup';
      actualProfileComplete = true;
    } else {
      // No profile records = use Clerk metadata (for new/incomplete users)
      actualUserType = clerkUserType;
      actualProfileComplete = clerkComplete;
    }

    const dbComplete = user.profileComplete;
    const dbUserType = user.userType as 'startup' | 'stakeholder' | 'admin';

    // Check if sync is needed
    const needsSync = actualProfileComplete !== dbComplete || actualUserType !== dbUserType;

    if (needsSync) {
      console.log(`Syncing profile status for user ${clerkUserId}:`);
      console.log(`  profileComplete: DB=${dbComplete} -> Actual=${actualProfileComplete}`);
      console.log(`  userType: DB=${dbUserType} -> Actual=${actualUserType}`);

      if (stakeholderProfile || startupProfile) {
        console.log(`Using actual profile records as source of truth (ignoring Clerk metadata)`);
      }

      // Update database to match actual status
      await db
        .update(users)
        .set({
          profileComplete: actualProfileComplete,
          userType: actualUserType,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, clerkUserId));

      return {
        profileComplete: actualProfileComplete,
        userType: actualUserType,
        wasUpdated: true,
      };
    }

    return {
      profileComplete: actualProfileComplete,
      userType: actualUserType,
      wasUpdated: false,
    };
  } catch (error) {
    console.error('Error syncing user profile status:', error);
    throw error;
  }
}

/**
 * Sets both Clerk metadata and database profileComplete to true.
 * Used when a user completes onboarding to ensure both systems are updated.
 */
export async function markProfileComplete(
  clerkUserId: string,
  userType: 'startup' | 'stakeholder' | 'admin'
): Promise<void> {
  try {
    const clerk = await clerkClient();

    // Update Clerk metadata
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        userType,
        onboardingComplete: true,
      },
    });

    // Update database
    await db
      .update(users)
      .set({
        profileComplete: true,
        userType,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkUserId));

    console.log(`Marked profile complete for user ${clerkUserId} as ${userType}`);
  } catch (error) {
    console.error('Error marking profile complete:', error);
    throw error;
  }
}
