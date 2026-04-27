import type { NextConfig } from "next";

const r2PublicUrl =
  process.env.R2_PUBLIC_URL ??
  process.env.R2_PUBLIC_BASE_URL ??
  process.env.R2_CUSTOM_DOMAIN;

const r2PublicHost = (() => {
  if (!r2PublicUrl) return null;

  try {
    const normalized = r2PublicUrl.startsWith("http")
      ? r2PublicUrl
      : `https://${r2PublicUrl}`;
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
})();

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "**.r2.dev",
  },
  {
    protocol: "https",
    hostname: "**.r2.cloudflarestorage.com",
  },
];

if (r2PublicHost) {
  remotePatterns.push({
    protocol: "https",
    hostname: r2PublicHost,
  });
}

const nextConfig: NextConfig = {
  output: undefined,

  images: {
    remotePatterns,
    // Next.js-serveren når ikke R2 for server-side optimering.
    // Browseren henter bildene direkte fra R2 CDN i stedet.
    unoptimized: true,
  },

  webpack(config) {
    config.infrastructureLogging = { level: "error" };
    return config;
  },
};

export default nextConfig;
