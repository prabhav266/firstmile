import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Disable turbopack in dev if needed, or customize
  },
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

export default nextConfig;
