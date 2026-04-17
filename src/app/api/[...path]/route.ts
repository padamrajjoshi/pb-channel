import { NextRequest, NextResponse } from "next/server";
import { decodePath } from "@/lib/url-map";

// BACKEND_API_URL is set in Vercel/production environment variables.
// BACKEND_LOCAL_API_URL is used for local development only.
// If neither is set, the proxy will fail loudly so misconfiguration is caught early.
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.BACKEND_LOCAL_API_URL;

if (!BACKEND_URL) {
  console.error("[Proxy] CRITICAL: No backend URL configured! Set BACKEND_API_URL in your environment variables.");
}

/**
 * This route handler manually proxies auth requests to the backend
 * and critically forwards Set-Cookie headers back to the browser.
 * Next.js rewrites do NOT forward Set-Cookie headers.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params, "GET");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params, "PUT");
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params, "DELETE");
}

export async function OPTIONS(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params, "OPTIONS");
}

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  if (!BACKEND_URL) {
    return new NextResponse(
      JSON.stringify({ 
        error: "Proxy misconfigured", 
        details: "BACKEND_API_URL is not set. Add it to your Vercel/production environment variables.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { path } = await params;
    const obfuscatedPathStr = path.join("/");
    const realPathStr = decodePath(obfuscatedPathStr); // Decode obfuscated → real
    const search = request.nextUrl.search;
    const targetUrl = `${BACKEND_URL}/v1/${realPathStr}${search}`;

    console.log(`[Proxy] ${method} ${request.nextUrl.pathname} (${obfuscatedPathStr} → ${realPathStr}) -> ${targetUrl}`);

    // Forward request headers (including Cookie for authenticated requests)
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lowKey = key.toLowerCase();
      // Skip headers that should be managed by the proxy/fetch or cause conflicts
      if (!["host", "connection", "transfer-encoding", "content-length", "referer", "origin"].includes(lowKey)) {
        headers.set(key, value);
      }
    });

    // Add a default User-Agent if none exists to avoid being blocked by WAFs
    if (!headers.has("user-agent")) {
      headers.set("user-agent", "NextJS-Proxy/1.0");
    }

    let body: BodyInit | null = null;
    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      body = await request.text();
    }

    const backendResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Follow redirects server-side so the browser never talks to backend directly
      redirect: "follow",
    });

    // Build the response - forward all headers from backend, but rewrite Set-Cookie
    // to ensure cookies are stored under the FRONTEND domain (Vercel), not the backend domain.
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        // Rewrite cookie: strip 'domain=...' so the browser stores it under
        // the current origin (pb-channel / Vercel) instead of pb-api.pebiglobe.com
        const rewritten = value
          .replace(/;\s*domain=[^;]*/gi, "")
          .replace(/;\s*samesite=none/gi, "; SameSite=Lax");
        
        // Ensure path=/ exists
        const withPath = rewritten.includes("path=") 
          ? rewritten 
          : rewritten + "; Path=/";
        
        responseHeaders.append("Set-Cookie", withPath);
      } else {
        responseHeaders.append(key, value);
      }
    });

    const responseBody = await backendResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Proxy Error]", error);
    
    // Construct extra diagnostic info
    const { path } = await params;
    const pathStr = path.join("/");
    const targetUrl = `${BACKEND_URL}/v1/${pathStr}${request.nextUrl.search}`;

    return new NextResponse(
      JSON.stringify({ 
        error: "Proxy failed to reach backend", 
        targetUrl,
        details: error instanceof Error ? error.message : String(error),
        troubleshooting: "This is often caused by a faulty IPv6 (AAAA) record in your DNS. If you are using Hostinger or Cloudflare, try disabling IPv6 or removing the AAAA record for pb-api.pebiglobe.com.",
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 502, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
