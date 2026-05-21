/** @type {import('next').NextConfig} */
const nextConfig = {
  // transpilePackages: ['@ecommerce/ui', '@ecommerce/api-client', '@ecommerce/utils'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
