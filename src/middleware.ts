import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/connections(.*)',
  '/admin(.*)',
  '/onboarding(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
    
    // After authentication, ensure user exists in database
    const { userId, sessionClaims } = await auth()
    
    if (userId && sessionClaims) {
      try {
        // Check if user exists in our database
        const existingUser = await db.query.users.findFirst({
          where: eq(users.clerkId, userId),
        })
        
        if (!existingUser) {
          // Create user in our database
          await db.insert(users).values({
            id: crypto.randomUUID(),
            clerkId: userId,
            email: sessionClaims.email as string,
            firstName: sessionClaims.firstName as string || '',
            lastName: sessionClaims.lastName as string || '',
            userType: 'startup', // Default to startup, can be changed later
            profileComplete: false,
          })
        }
      } catch (error) {
        console.error('Error creating user in middleware:', error)
        // Don't block the request, just log the error
      }
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 