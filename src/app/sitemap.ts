import { MetadataRoute } from "next";
import { db } from "@/lib/db";

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

  // Hent alle kommende kurssesjoner
  const sessions = await db.courseSession.findMany({
    where: {
      startsAt: {
        gte: new Date(),
      },
      status: "OPEN",
    },
    include: {
      course: {
        select: {
          slug: true,
        },
      },
    },
  });

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
  ];

  // Kurssider
  const coursePages = courses.map((course) => ({
    url: `${baseUrl}/kurs/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Påmeldingssider
  const enrollmentPages = sessions.map((session) => ({
    url: `${baseUrl}/kurs/${session.course.slug}/pamelding/${session.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...coursePages, ...enrollmentPages];
}

