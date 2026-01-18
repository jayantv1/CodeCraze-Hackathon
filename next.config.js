/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ultra-lightweight build configuration
  output: 'standalone',
  // API_URL is used to proxy requests to the backend (e.g. in Docker)
  // If not set, it falls back to localhost:5328 in dev or /api/ in prod (Vercel style)
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    // Reduce memory usage
    workerThreads: false,
    cpus: 1,
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.API_URL
            ? `${process.env.API_URL}/api/:path*`
            : process.env.NODE_ENV === 'development'
              ? 'http://127.0.0.1:5328/api/:path*'
              : '/api/',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
