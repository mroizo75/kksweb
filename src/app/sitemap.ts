import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { supportedLocationSlugs } from "@/lib/locations";
import { getSessionLocationKeywords } from "@/lib/location-matching";

/**
 * Dynamisk Sitemap Generator
 * Automatisk inkludering av alle kurs og sider
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

  // Hent alle publiserte kurs
  const courses = await db.course.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Lokasjonssider for lokal SEO — alle byer og kommuner
  const highPriorityLocations = new Set([
    "oslo", "bergen", "trondheim", "stavanger", "kristiansand", "tromso",
    "hamar", "drammen", "lierbyen",
  ]);
  const locationPages = supportedLocationSlugs.map((location) => ({
    url: `${baseUrl}/lokasjon/${location}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: highPriorityLocations.has(location) ? 0.88 : 0.80,
  }));

  // Statiske sider
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kurs`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arbeid-i-hoyden`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/saas`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bedrift`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bht-medlem`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portefolje`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/om-oss`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/personvern`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/vilkar`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/klage`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  // Kurssider
  const coursePages = courses.map((course) => ({
    url: `${baseUrl}/kurs/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const openSessions = await db.courseSession.findMany({
    where: {
      startsAt: { gte: new Date() },
      status: "OPEN",
      course: { published: true },
    },
    select: {
      location: true,
      updatedAt: true,
      course: {
        select: {
          slug: true,
          updatedAt: true,
        },
      },
    },
  });

  const localCoursePageMap = new Map<string, Date>();
  for (const session of openSessions) {
    const sessionLocation = session.location.toLowerCase();
    for (const locationSlug of supportedLocationSlugs) {
      const keywords = getSessionLocationKeywords(locationSlug);
      const isMatch = keywords.some((keyword) => sessionLocation.includes(keyword));
      if (!isMatch) {
        continue;
      }

      const key = `${locationSlug}:${session.course.slug}`;
      const candidateDate = session.updatedAt > session.course.updatedAt
        ? session.updatedAt
        : session.course.updatedAt;
      const existingDate = localCoursePageMap.get(key);
      if (!existingDate || candidateDate > existingDate) {
        localCoursePageMap.set(key, candidateDate);
      }
    }
  }

  const localCoursePages = Array.from(localCoursePageMap.entries()).map(
    ([key, lastModified]) => {
      const [locationSlug, courseSlug] = key.split(":");
      return {
        url: `${baseUrl}/lokasjon/${locationSlug}/${courseSlug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.86,
      };
    }
  );

  const blogPosts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const blogPages = [
    {
      url: `${baseUrl}/blogg`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.85,
    },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blogg/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];

  return [...staticPages, ...locationPages, ...coursePages, ...localCoursePages, ...blogPages];
}

