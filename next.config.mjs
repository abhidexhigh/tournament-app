/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === "production";

    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
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
          },
        ],
      },
    ];
  },
};

export default nextConfig;
