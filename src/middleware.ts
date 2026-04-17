import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: Rewrites obfuscated base path to the real /api path.
 *
 * Browser sends:   /t4x8n2q6/x9k2m7p4q1/login
 * Middleware sees: /t4x8n2q6/...
 * Rewrites to:     /api/x9k2m7p4q1/login       (internal, never seen by browser)
 * Proxy then maps: /v1/auth/login               → backend
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/t4x8n2q6/")) {
    const realPath = pathname.replace("/t4x8n2q6/", "/api/");
    const url = request.nextUrl.clone();
    url.pathname = realPath;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // IMPORTANT: This must match OBFUSCATED_BASE in src/lib/url-map.ts ("t4x8n2q6")
  // Next.js requires a static string here — no variables allowed.
  matcher: ["/t4x8n2q6/:path*"],
};
