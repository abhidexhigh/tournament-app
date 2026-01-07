import { NextResponse } from "next/server";

export function middleware(request) {
  // Create response
  const response = NextResponse.next();

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === "production";

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

    // Content Security Policy - Secure configuration
    // Using 'strict-dynamic' allows scripts loaded by trusted scripts (Next.js pattern)
    // This is more secure than 'unsafe-inline' while still supporting Next.js
    "Content-Security-Policy": [
      "default-src 'self'",
      // script-src: Use strict-dynamic for Next.js, allow Stripe
      // 'strict-dynamic' allows scripts loaded by trusted scripts (Next.js pattern)
      // unsafe-eval only in development (Next.js hot reload needs it)
      `script-src 'self' 'strict-dynamic' ${
        isProduction ? "" : "'unsafe-eval'"
      } https://js.stripe.com https://checkout.stripe.com`,
      // style-src: Remove unsafe-inline, allow Google Fonts stylesheets only
      // Note: If you use inline styles (e.g., Tailwind), you may need to add 'unsafe-inline'
      // but it's better to use external stylesheets or nonces
      "style-src 'self' https://fonts.googleapis.com",
      // img-src: Be specific instead of allowing all https:
      "img-src 'self' data: blob: https://res.cloudinary.com https://flagcdn.com https://*.stripe.com",
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
