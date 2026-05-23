/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ecommerce/ui', '@ecommerce/api-client', '@ecommerce/utils'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MOCK_API: process.env.NEXT_PUBLIC_MOCK_API,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/:path*', // Proxy to Backend
      },
    ]
  },
};

module.exports = nextConfig;
