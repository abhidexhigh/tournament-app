import { NextResponse } from "next/server";

// Generate a cryptographically secure nonce
function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}

// Get allowed origins for CORS
function getAllowedOrigins() {
  const origins = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean);

  // In development, also allow localhost
  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return origins;
}

// Check if origin is allowed
function isAllowedOrigin(origin) {
  if (!origin) return true; // Same-origin requests have no Origin header
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.some(
    (allowed) => allowed && origin.toLowerCase() === allowed.toLowerCase(),
  );
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Handle API routes with CORS restrictions
  if (pathname.startsWith("/api")) {
    // Handle preflight OPTIONS requests
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });

      // Only set CORS headers if origin is allowed
      if (isAllowedOrigin(origin)) {
        if (origin) {
          response.headers.set("Access-Control-Allow-Origin", origin);
        }
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS",
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-CSRF-Token",
        );
        response.headers.set("Access-Control-Max-Age", "86400");
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }

      // Security headers for preflight
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");

      return response;
    }

    // For actual API requests, validate origin
    if (origin && !isAllowedOrigin(origin)) {
      return new NextResponse(
        JSON.stringify({ error: "CORS origin not allowed" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }

    // Create response for API routes with CORS headers
    const response = NextResponse.next();

    // Set CORS headers only for allowed origins
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    // Essential security headers for API routes
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
  }

  // Generate a unique nonce for this request (non-API routes)
  const nonce = generateNonce();

  // Create response with nonce header for server components to read
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set on response for client access if needed
  response.headers.set("x-nonce", nonce);

  // Check if we're in development or production
  const isDev = process.env.NODE_ENV === "development";

  // Build CSP directives with nonce-based security
  // Using 'strict-dynamic' allows scripts loaded by nonced scripts to execute
  // This is the recommended approach for modern CSP
  const cspDirectives = [
    // Default: only allow from same origin
    "default-src 'self'",

    // Scripts: Use nonce-based CSP with strict-dynamic
    // 'strict-dynamic' allows dynamically loaded scripts from trusted (nonced) scripts
    // 'unsafe-eval' is only needed in development for hot reloading
    isDev
      ? `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com`
      : `script-src 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://checkout.stripe.com`,

    // Styles: Using 'unsafe-inline' because React/Tailwind generate many inline styles
    // CSS injection is much harder to exploit for XSS than JS injection
    // The real security benefit is in script-src where we use nonce-based CSP
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     *
     * API routes ARE included for CORS and security header enforcement
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};
