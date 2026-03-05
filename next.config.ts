import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: undefined,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  webpack(config) {
    config.infrastructureLogging = { level: "error" };
    return config;
  },
};

export default nextConfig;
