/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enable ESLint for better code quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking for better type safety
    ignoreBuildErrors: false,
  },
  images: {
    // Optimize images for better performance
    unoptimized: false,
    domains: ['localhost'],
  },
  // Enable static export for deployment
  output: process.env.BUILD_STANDALONE ? 'standalone' : undefined,
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
