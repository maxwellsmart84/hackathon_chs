import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { syncUserProfileStatus } from '@/lib/services/profile-sync';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    let user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    // If user doesn't exist, create them from Clerk data
    if (!user) {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);

      // Sync to get the correct status from Clerk metadata
      const syncResult = await syncUserProfileStatus(userId);

      // Create new user with synced data
      const newUser = {
        id: crypto.randomUUID(),
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        userType: syncResult.userType,
        profileComplete: syncResult.profileComplete,
      };

      await db.insert(users).values(newUser);

      // Fetch the user again to get all fields (createdAt, updatedAt, etc.)
      user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });
    } else {
      // User exists - sync with Clerk metadata
      const syncResult = await syncUserProfileStatus(userId);

      if (syncResult.wasUpdated) {
        // Fetch updated user data
        user = await db.query.users.findFirst({
          where: eq(users.clerkId, userId),
        });
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        profileComplete: user.profileComplete,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
