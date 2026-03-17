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
  // R2_PUBLIC_URL settes som env-variabel, f.eks. https://assets.kksas.no
  // next/image håndterer dette automatisk via remotePatterns wildcard over

  webpack(config) {
    config.infrastructureLogging = { level: "error" };
    return config;
  },
};

export default nextConfig;
