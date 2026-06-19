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
    NEXT_PUBLIC_MOCKED_APIS: process.env.NEXT_PUBLIC_MOCKED_APIS,
    NEXT_PUBLIC_MOCK_TOKEN: process.env.NEXT_PUBLIC_MOCK_TOKEN,
  },
};

module.exports = nextConfig;
