import { NextRequest, NextResponse } from 'next/server'

// ── Routes ────────────────────────────────────────────────────────
const PUBLIC_ROUTES = ['/', '/login', '/register']
const LOGIN_ROUTE   = '/login'

// ── Rate Limiter ──────────────────────────────────────────────────
// Simple in-memory store: ip → { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Returns true if the request should be BLOCKED
function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now   = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= limit) return true
  entry.count++
  return false
}

// Clean up expired entries every 5 minutes to prevent memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    rateLimitStore.forEach((v, k) => { if (now > v.resetAt) rateLimitStore.delete(k) })
  }, 5 * 60 * 1000)
}

// ── Rate limit rules ──────────────────────────────────────────────
const RATE_RULES: { path: string; limit: number; windowMs: number }[] = [
  { path: '/api/auth/login',        limit: 10, windowMs: 60_000 },  // 10 / min
  { path: '/api/auth/register',     limit: 5,  windowMs: 60_000 },  // 5  / min
  { path: '/api/wallet/add',        limit: 10, windowMs: 60_000 },  // 10 / min
  { path: '/api/wallet/verify',     limit: 10, windowMs: 60_000 },  // 10 / min
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Rate limiting on sensitive API routes ─────────────────────
  const rule = RATE_RULES.find(r => pathname === r.path)
  if (rule) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
              ?? req.headers.get('x-real-ip')
              ?? 'unknown'

    if (isRateLimited(ip, rule.limit, rule.windowMs)) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
  }

  // ── Skip internals / static files / all API routes ───────────
  if (
    pathname.startsWith('/_next')   ||
    pathname.startsWith('/api')     ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── Public pages ──────────────────────────────────────────────
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // ── Auth guard ────────────────────────────────────────────────
  const session = req.cookies.get('parkspot_session')?.value
  if (!session) {
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
