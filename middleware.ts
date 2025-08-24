import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Protect application routes: allow public paths (/, /auth/*, /api/*, _next, static)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public and static routes
  if (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Try to get NextAuth token (returns null if not present)
  let token = null
  try {
    token = await getToken({ req, secret: process.env.AUTH_SECRET })
  } catch (err) {
    // ignore errors and treat as unauthenticated
    token = null
  }

  if (!token) {
    // Redirect unauthenticated users to the public landing page, preserving callback
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|auth|static|favicon.ico).*)'],
}