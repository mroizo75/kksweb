import { MetadataRoute } from "next";

/**
 * Robots.txt Generator
 * Optimalisert for SEO og crawling
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/*",
          "/min-side/*",
          "/api/*",
          "/_next/*",
          "/verify/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/*",
          "/min-side/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

