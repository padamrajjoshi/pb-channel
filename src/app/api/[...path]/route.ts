import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.BACKEND_LOCAL_API_URL || "http://127.0.0.1:8000";

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
  try {
    const { path } = await params;
    const pathStr = path.join("/");
    const search = request.nextUrl.search;
    const targetUrl = `${BACKEND_URL}/v1/${pathStr}${search}`;

    console.log(`[Proxy] ${method} ${request.nextUrl.pathname} -> ${targetUrl}`);

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

    // Build the response with all headers from backend
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      responseHeaders.append(key, value);
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
