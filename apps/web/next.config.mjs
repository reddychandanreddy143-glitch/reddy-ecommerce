/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@reddy/common'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
