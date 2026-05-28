import { NextRequest, NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

function buildCsp(nonce: string): string {
  const directives = [
    "default-src 'self'",
    // 'strict-dynamic' lets trusted (nonce'd) scripts load further scripts
    // without needing individual nonces; removes the need for 'unsafe-inline'.
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
    "font-src https://fonts.gstatic.com",
    "connect-src 'self'",
    "img-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (isProd) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function proxy(request: NextRequest): NextResponse {
  // Generate a fresh per-request nonce. 128 bits of randomness via Web Crypto
  // so the nonce cannot be predicted or reused across requests.
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  // Enforce same-origin for all API calls.
  // Browsers always set Origin on cross-origin requests, so a mismatched (or
  // unparseable) Origin means a different site is trying to use our API.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    if (origin) {
      let valid = false;
      try {
        const { host: originHost } = new URL(origin);
        const host =
          request.headers.get("x-forwarded-host") ??
          request.headers.get("host") ??
          request.nextUrl.host;
        valid = originHost === host;
      } catch {
        valid = false;
      }
      if (!valid) {
        return new NextResponse(JSON.stringify({ error: "Forbidden." }), {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      }
    }
  }

  // Forward nonce to server components so Next.js applies it to its own
  // bootstrap <script> elements, keeping inline scripts nonce-consistent.
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: reqHeaders } });
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  return response;
}

export const config = {
  // Run on all routes except Next.js internal static assets so every page
  // response gets a fresh per-request CSP nonce.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
