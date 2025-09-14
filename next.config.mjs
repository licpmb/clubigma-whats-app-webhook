/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: []
  },
  // Ensure raw body parsing for webhook signature verification
  api: {
    bodyParser: false,
    responseLimit: '1mb',
  },
  // Optimize for webhook handling
  poweredByHeader: false,
  compress: true,
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
