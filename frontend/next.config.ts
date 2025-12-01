import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ISR On-Demand Configuration for high traffic anime platform
  // Turbopack is enabled by default in Next.js 16
  turbopack: {},

  // Image optimization for anime covers
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
        pathname: '/api/upload/image/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Cache images for 1 year in browser (anime covers rarely change)
    minimumCacheTTL: 31536000,
  },

  // Headers for optimal caching strategy
  async headers() {
    return [
      {
        // Static images - cache for 1 year (immutable)
        source: '/api/upload/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Home page with slider - ISR On-Demand only
        // No caching on HTTP level, rely on ISR tags
        source: '/home',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Hero slider page - ISR On-Demand only
        // No caching on HTTP level, rely on ISR tags
        source: '/hero-slider',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Default for other pages - minimal caching
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },

  // Redirects for old URLs if needed
  async redirects() {
    return []
  },

  // Rewrites for API proxy if needed
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
