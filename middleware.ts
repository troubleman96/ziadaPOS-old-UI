/**
 * middleware.ts — Ziada POS route protection (Edge Runtime)
 *
 * Reads the `ziada_session` cookie (set by lib/auth.ts on login/register).
 * The actual JWT lives in localStorage; the cookie is a presence flag only.
 *
 * Rules:
 *   Auth routes  (/auth/login, /auth/register)
 *     → if session cookie present: redirect to /dashboard
 *     → otherwise: allow through
 *
 *   Protected app routes  (/dashboard, /pos, /inventory, …)
 *     → if no session cookie: redirect to /auth/login?next=<original-path>
 *     → otherwise: allow through
 *
 *   Public routes  (/, /_next/*, /api/*, /icons/*, /public assets)
 *     → always allow
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'ziada_session';

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/pos',
  '/inventory',
  '/transactions',
  '/customers',
  '/credits',
  '/stores',
  '/suppliers',
  '/analytics',
  '/reports',
  '/settings',
  '/ai',
  '/staff',
  '/notebook',
  '/help',
  '/profile',
];

// Routes that should redirect to /dashboard when already authenticated
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // ── Auth routes: bounce already-signed-in users to the app ────────────────
  if (AUTH_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── Protected routes: require a session ───────────────────────────────────
  if (PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    if (!hasSession) {
      const loginUrl = new URL('/auth/login', request.url);
      // Preserve the intended destination so the login page can redirect back
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Run on all routes except Next.js internals and static files.
   * This avoids processing _next/static, _next/image, favicon.ico, etc.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|js|css|woff|woff2|ttf|otf)$).*)',
  ],
};
