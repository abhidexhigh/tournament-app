import { NextResponse } from "next/server";

export function middleware(request) {
  // Create response
  const response = NextResponse.next();

  // Check if we're in development or production
  const isDev = process.env.NODE_ENV === "development";

  // Build CSP directives
  // Note: Next.js requires 'unsafe-inline' and 'unsafe-eval' for its hydration scripts
  // Full nonce-based CSP requires Next.js experimental CSP support or custom _document
  // This is a practical CSP that balances security with Next.js compatibility
  const cspDirectives = [
    // Default: only allow from same origin
    "default-src 'self'",

    // Scripts: Allow self, specific trusted domains, and inline scripts
    // 'unsafe-inline' is required for Next.js hydration scripts
    // 'unsafe-eval' is only needed in development for hot reloading
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com"
      : "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",

    // Styles: Allow self, inline styles (required for React/Tailwind), and Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Images: Restrict to specific trusted domains only (no broad https:)
    "img-src 'self' data: blob: https://res.cloudinary.com https://flagcdn.com https://lh3.googleusercontent.com",

    // Fonts: Google Fonts and data URIs
    "font-src 'self' https://fonts.gstatic.com data:",

    // API connections: Only to known services
    "connect-src 'self' https://api.stripe.com https://*.stripe.com https://res.cloudinary.com https://vitals.vercel-insights.com",

    // Frames: Only Stripe for payment forms and YouTube for embeds
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.youtube.com",

    // Block all plugins/embeds (Flash, Java, etc.)
    "object-src 'none'",

    // Restrict base URI to prevent base tag hijacking
    "base-uri 'self'",

    // Restrict form submissions to same origin
    "form-action 'self'",

    // Prevent framing by other sites (clickjacking protection)
    "frame-ancestors 'self'",

    // Upgrade HTTP to HTTPS automatically
    "upgrade-insecure-requests",
  ];

  // Security headers
  const securityHeaders = {
    // Prevent DNS prefetching
    "X-DNS-Prefetch-Control": "on",

    // Force HTTPS (HSTS) - 2 years with preload
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

    // Prevent clickjacking
    "X-Frame-Options": "SAMEORIGIN",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // XSS Protection (legacy browser support)
    "X-XSS-Protection": "1; mode=block",

    // Control referrer information
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy - disable unused browser features
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",

    // Content Security Policy
    "Content-Security-Policy": cspDirectives.join("; "),
  };

  // Apply security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

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
