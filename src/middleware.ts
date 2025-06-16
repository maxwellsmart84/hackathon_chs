import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/connections(.*)',
  '/admin(.*)',
  '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // Redirect authenticated users from root to dashboard
    if (req.nextUrl.pathname === '/') {
      const { userId } = await auth();
      if (userId) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    if (isProtectedRoute(req)) {
      await auth.protect();
      // Only check for userId, do not call currentUser() here
      // Optionally, you can set a header or cookie for downstream API routes to handle user creation
      // But do not attempt DB writes or call currentUser() in middleware
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // Let the request continue but log the error
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Explicitly include all dashboard and protected routes
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/api/connections/:path*',
    '/api/users/:path*',
    '/api/startups/:path*',
    '/api/stakeholders/:path*',
  ],
};
