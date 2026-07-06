import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Passthrough — Clerk handshake fails in CF Workers when CLERK_SECRET_KEY is dev key.
// Dashboard is protected server-side. Fix: set live CLERK_SECRET_KEY via wrangler secret put.
export function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
