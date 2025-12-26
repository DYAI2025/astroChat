/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elevenlabs.io',
      },
      {
        protocol: 'https',
        hostname: 'r2-bucket.flowith.net',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // API rewrites to backend
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:8000'

    return [
      // Proxy direct API calls to FastAPI backend
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/v1/:path*`,
      },
    ]
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Webpack config for ElevenLabs widget
  webpack: (config) => {
    // Allow ElevenLabs custom elements
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    })

    return config
  },
}

module.exports = nextConfig
