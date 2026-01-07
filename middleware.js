import { NextResponse } from "next/server";

// Generate a cryptographic nonce for CSP
function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}

export function middleware(request) {
  // Create response
  const response = NextResponse.next();

  // Generate nonce for this request
  const nonce = generateNonce();

  // Check if we're in development or production
  const isDev = process.env.NODE_ENV === "development";

  // Build CSP directives
  // In production: Use nonces and strict-dynamic for better security
  // In development: Allow unsafe-eval for hot reloading
  const cspDirectives = [
    // Default: only allow from same origin
    "default-src 'self'",

    // Scripts: Use nonce-based approach with strict-dynamic
    // 'strict-dynamic' allows scripts loaded by trusted scripts
    // In dev mode, we need 'unsafe-eval' for hot reloading
    isDev
      ? `script-src 'self' 'unsafe-eval' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://checkout.stripe.com`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://checkout.stripe.com`,

    // Styles: Use 'unsafe-inline' WITHOUT nonce
    // IMPORTANT: When nonce is present, 'unsafe-inline' is ignored by browsers
    // Since React/Tailwind use inline styles without nonces, we must use 'unsafe-inline' alone
    // This is a known limitation - fully securing styles requires CSS extraction
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Images: Restrict to specific trusted domains (removed broad https:)
    "img-src 'self' data: blob: https://res.cloudinary.com https://flagcdn.com https://lh3.googleusercontent.com",

    // Fonts: Google Fonts and data URIs
    "font-src 'self' https://fonts.gstatic.com data:",

    // API connections: Only to known services
    "connect-src 'self' https://api.stripe.com https://*.stripe.com https://res.cloudinary.com https://vitals.vercel-insights.com",

    // Frames: Only Stripe for payment forms
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.youtube.com",

    // Block all plugins/embeds
    "object-src 'none'",

    // Restrict base URI to prevent base tag hijacking
    "base-uri 'self'",

    // Restrict form submissions to same origin
    "form-action 'self'",

    // Prevent framing by other sites (clickjacking protection)
    "frame-ancestors 'self'",

    // Upgrade HTTP to HTTPS
    "upgrade-insecure-requests",

    // Report CSP violations (optional - set up an endpoint to collect reports)
    // "report-uri /api/csp-report",
  ];

  // Security headers
  const securityHeaders = {
    // Prevent DNS prefetching
    "X-DNS-Prefetch-Control": "on",

    // Force HTTPS (HSTS)
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

    // Prevent clickjacking
    "X-Frame-Options": "SAMEORIGIN",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // XSS Protection (legacy but still useful)
    "X-XSS-Protection": "1; mode=block",

    // Control referrer information
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy (formerly Feature-Policy)
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",

    // Content Security Policy
    "Content-Security-Policy": cspDirectives.join("; "),
  };

  // Apply security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Store nonce in header for use in _document or layout
  response.headers.set("X-Nonce", nonce);

  // Additional security: Remove server information
  response.headers.delete("X-Powered-By");
  response.headers.delete("Server");

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};
