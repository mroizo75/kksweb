import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure static files are served correctly
  output: undefined, // Default output mode (not standalone)
  
  // Allow all image domains (for course images, etc)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
