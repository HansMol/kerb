import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/dealers/register'])

export default clerkMiddleware(async (auth, req) => {
  // A founding dealer invite is for someone with no Kerb account yet: send a
  // signed-out visitor to sign-up, not sign-in, and keep the invite in the
  // return address (found 14 Oct 2026: sign-in told Hans "Couldn't find your account").
  if (req.nextUrl.pathname === '/dealers/register' && req.nextUrl.searchParams.has('invite')) {
    const { userId } = await auth()
    if (!userId) {
      const signUp = new URL('/sign-up', req.url)
      signUp.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signUp)
    }
  }
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
