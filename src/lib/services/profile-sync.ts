import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Ensures a user's profileComplete status is synced between Clerk metadata and our database.
 * Clerk metadata is treated as the source of truth.
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

    const dbComplete = user.profileComplete;
    const dbUserType = user.userType;

    // Check if sync is needed
    const needsSync = clerkComplete !== dbComplete || clerkUserType !== dbUserType;

    if (needsSync) {
      console.log(`Syncing profile status for user ${clerkUserId}:`);
      console.log(`  profileComplete: DB=${dbComplete} -> Clerk=${clerkComplete}`);
      console.log(`  userType: DB=${dbUserType} -> Clerk=${clerkUserType}`);

      // Update database to match Clerk metadata
      await db
        .update(users)
        .set({
          profileComplete: clerkComplete,
          userType: clerkUserType,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, clerkUserId));

      return {
        profileComplete: clerkComplete,
        userType: clerkUserType,
        wasUpdated: true,
      };
    }

    return {
      profileComplete: clerkComplete,
      userType: clerkUserType,
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
