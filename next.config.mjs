/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  
  // Enable compression for smaller bundle sizes
  compress: true,
  
  // Enable experimental CSP nonce support
  // This allows Next.js to automatically inject nonces into inline scripts
  experimental: {
    // Read nonce from x-nonce header set by middleware
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Optimize package imports for faster builds and smaller bundles
    optimizePackageImports: [
      "react-icons",
      "date-fns",
      "lodash",
    ],
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
    return [
      {
        // Apply security headers to API routes (middleware doesn't cover these)
        source: "/api/:path*",
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
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          // API routes have a simpler CSP - no scripts needed
          {
            key: "Content-Security-Policy",
            value: ["default-src 'none'", "frame-ancestors 'none'"].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
