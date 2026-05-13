import type { NextConfig } from "next";

/**
 * Build the Content-Security-Policy + companion security headers applied to every route.
 *
 * Notes:
 * - `'unsafe-inline'` in `script-src` is required because <Script id="theme-bootstrap" strategy="beforeInteractive">
 *   in app/layout.tsx is emitted inline (no nonce available with static rendering). Same reasoning for
 *   style-src (Tailwind / React inline styles).
 * - `'unsafe-eval'` is permitted only in development so React can attach to the source map / debug runtime.
 * - `connect-src` must include the Portfolio API origin so the chat stream works. We read it from
 *   NEXT_PUBLIC_CHAT_API_URL at build time so production deploys automatically allow the configured host.
 */
function buildSecurityHeaders() {
  const isDev = process.env.NODE_ENV !== "production";

  const apiOrigin = (() => {
    const raw = process.env.NEXT_PUBLIC_CHAT_API_URL?.trim();
    if (!raw) return null;
    try {
      return new URL(raw).origin;
    } catch {
      return null;
    }
  })();

  const connectSrc = ["'self'", "https://vitals.vercel-insights.com"];
  if (apiOrigin) connectSrc.push(apiOrigin);
  if (isDev) connectSrc.push("http://localhost:5063", "ws://localhost:3000", "http://localhost:3000");

  const scriptSrc = ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"];
  if (isDev) scriptSrc.push("'unsafe-eval'");

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
  ];
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: buildSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
