import { NextRequest, NextResponse } from 'next/server'

// Routes that are accessible WITHOUT login
const PUBLIC_ROUTES = ['/', '/login', '/register']
// Default redirect for unauthenticated users
const LOGIN_ROUTE = '/login'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow Next.js internals, static files, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')   ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')          // static files (images, etc.)
  ) {
    return NextResponse.next()
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for session cookie
  const session = req.cookies.get('parkspot_session')?.value

  if (!session) {
    // Not logged in — redirect to login page
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = LOGIN_ROUTE
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
