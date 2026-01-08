import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Vercel Image Optimization to reduce usage
    // External images from Google Drive will be served directly
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'bcsddthojapzxyrpvjur.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
