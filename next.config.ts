import type { NextConfig } from "next";

// Content-Security-Policy tuned to exactly what the app loads:
// - PostHog: ingestion (us.i.posthog.com) + the lazily-loaded session-replay
//   recorder/assets (us-assets.i.posthog.com), which also needs worker blob:.
// - Brand favicons are inlined as SVG, and firm logos are local, so img only
//   needs self + data:.
// - Next.js + Tailwind inject inline <script>/<style>, so 'unsafe-inline' is
//   required; the app renders no user-supplied HTML (React/next-og escape all
//   output), so CSP here is defense-in-depth rather than the primary XSS guard.
const POSTHOG = "https://us.i.posthog.com https://us-assets.i.posthog.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${POSTHOG}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${POSTHOG}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
