import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    let user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    // If user does not exist, create them from Clerk
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: 'Clerk user not found' }, { status: 404 });
      }
      const newUser = {
        id: crypto.randomUUID(),
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        userType: 'startup', // Default to startup, can be changed later
        profileComplete: false,
      };
      await db.insert(users).values(newUser);
      // Fetch the user again to get all fields (createdAt, updatedAt, etc.)
      user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });
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
