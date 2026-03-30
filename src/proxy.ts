import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isAccountRoute = createRouteMatcher(['/account(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAccountRoute(req)) {
    await auth.protect()
  }

  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
