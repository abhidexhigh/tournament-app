/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Enable experimental CSP nonce support
  // This allows Next.js to automatically inject nonces into inline scripts
  experimental: {
    // Read nonce from x-nonce header set by middleware
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  // CSP headers are handled by middleware.js for dynamic nonce support
  // Static headers for non-CSP security headers only
  async headers() {
    // Common security headers for all routes
    const securityHeaders = [
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
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
    ];

    return [
      {
        // Apply security headers to ALL routes (including static assets)
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Additional headers specifically for API routes
        // CORS is handled dynamically by middleware.js with origin validation
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          // API routes have a stricter CSP - no scripts needed
          {
            key: "Content-Security-Policy",
            value: ["default-src 'none'", "frame-ancestors 'none'"].join("; "),
          },
        ],
      },
      {
        // Headers for Next.js static files
        source: "/_next/static/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
