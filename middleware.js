import { NextResponse } from "next/server";

export function middleware(request) {
  // Create response
  const response = NextResponse.next();

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
    // Note: CSP is also set in next.config.mjs, but we can enhance it here if needed
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob: https://flagcdn.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://api.stripe.com https://*.stripe.com https://res.cloudinary.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
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
