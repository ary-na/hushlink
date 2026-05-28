import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Static headers applied to every response.
// Content-Security-Policy is intentionally absent here — it is emitted
// per-request with a cryptographic nonce by proxy.ts so that 'unsafe-inline'
// is never needed for scripts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=()",
  },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

// Extra headers applied only to API routes so responses are never cached
// and CDNs respect the origin-dependent access control from middleware.
const apiHeaders = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
  { key: "Pragma", value: "no-cache" },
  { key: "Vary", value: "Origin" },
];

const nextConfig: NextConfig = {
  env: {
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/(.*)", headers: apiHeaders },
    ];
  },
};

export default nextConfig;
