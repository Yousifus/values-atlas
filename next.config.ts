import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// ── Content Security Policy ─────────────────────────────────────────────────
// The atlas is a static, client-rendered page, so the policy can be tight about
// *where* things load from even though it has to allow inline script and style:
//   - script-src needs 'unsafe-inline' for Next.js' own inline bootstrap scripts
//     (a static page cannot use per-request nonces). Escaping data-sourced text
//     (lib/escape.ts) is therefore the primary XSS defence; the CSP is the second
//     layer that stops injected markup from loading remote scripts, calling out
//     with fetch/XHR, or framing the page.
//   - style-src needs 'unsafe-inline' (Leaflet and the markers use inline style).
//
// Every third-party host is named here on purpose. Adding a map-tile provider,
// font CDN or analytics host means adding it below, which makes it a visible,
// reviewable decision. Current hosts:
//   server.arcgisonline.com  Esri map tiles (img)
//   api.fontshare.com        Satoshi + Boska stylesheet; fonts from cdn.fontshare.com
//   fonts.googleapis.com     Space Mono stylesheet;      fonts from fonts.gstatic.com
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com",
  "font-src 'self' https://cdn.fontshare.com https://fonts.gstatic.com",
  "img-src 'self' data: https://server.arcgisonline.com",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // Report-Only first: violations show in the browser console without blocking
  // anything. Flip to "Content-Security-Policy" once a preview loads clean.
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework in a response header.
  poweredByHeader: false,
  // The atlas never uses next/image, so switch the image optimizer off entirely.
  // That removes the /_next/image endpoint, which has been the target of several
  // recent Next.js advisories (SSRF, DoS, RCE).
  images: { unoptimized: true },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
