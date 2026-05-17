import { NextResponse, NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  // 1. Define Route Types
  const isAuthPage = pathname.startsWith('/login') ||
    pathname.startsWith('/otp') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');
  const isPublicAsset = pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('/api/');

  // 2. Skip middleware for static assets and API routes
  if (isPublicAsset) {
    return NextResponse.next();
  }

  // 3. Handle Authenticated Users visiting Login/Auth pages
  if (isAuthPage) {
    if (token) {
      try {
        // If token is present, verify and redirect to dashboard
        const payload = decodeJwt(token);
        if (payload.app_source === 'pb-dashboard' && payload.role !== 'CUSTOMER') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (e) {
        // Token invalid? Let them stay on login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 4. Handle Unauthenticated Users visiting Protected pages
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // Store the intended destination to redirect back after login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Security Enforcement for Authenticated Users
  try {
    const payload = decodeJwt(token);

    // Source Lock Enforcement
    if (payload.app_source !== 'pb-dashboard') {
      console.warn(`Security Alert: Platform Mismatch. User source: ${payload.app_source}`);
      return NextResponse.redirect(new URL('https://pebiglobe.com?error=invalid_platform', request.url));
    }

    // Role Restriction: Customers cannot access B2B Dashboard
    if (payload.role === 'CUSTOMER') {
      console.warn(`Security Alert: Customer account attempted dashboard access.`);
      return NextResponse.redirect(new URL('https://pebiglobe.com?error=unauthorized_role', request.url));
    }

  } catch (error) {
    console.error('Middleware JWT Decode Error:', error);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Optimized Matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes (handled by axios interceptors)
     * 2. /_next (Next.js internals)
     * 3. /fonts, /images, /favicon.ico (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|fonts|images|public).*)',
  ],
};
