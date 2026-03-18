import { Metadata } from "next";
import { db } from "@/lib/db";
import { normalizeR2ImageUrl } from "@/lib/r2";
import { stripHtml } from "@/lib/utils";
import { buildOsloCourseKeywords, OSLO_LOCATION_NAME, OSLO_REGION_NAME } from "@/lib/local-seo";

export async function generateCourseMetadata(slug: string): Promise<Metadata> {
  const course = await db.course.findUnique({
    where: { slug },
    select: {
      slug: true,
      image: true,
      description: true,
      title: true,
      durationDays: true,
      price: true,
      category: true,
      code: true,
      sessions: {
        where: {
          startsAt: {
            gte: new Date(),
          },
        },
        orderBy: {
          startsAt: "asc",
        },
        take: 10,
      },
    },
  });

  if (!course) {
    return {
      title: "Kurs ikke funnet",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const courseUrl = `${baseUrl}/kurs/${course.slug}`;
  const normalizedImage = normalizeR2ImageUrl(course.image);
  const imageUrl = normalizedImage
    ? normalizedImage.startsWith("http")
      ? normalizedImage
      : `${baseUrl}${normalizedImage}`
    : `${baseUrl}/placeholder-kurs.jpg`;

  const baseDescription = course.description
    ? stripHtml(course.description).replace(/\s+/g, " ").trim()
    : `${course.title} — Profesjonell kursing fra KKS AS. ${course.durationDays} ${
      course.durationDays === 1 ? "dag" : "dager"
    }. Fra kr ${course.price.toLocaleString("nb-NO")},-. Meld deg på i dag.`;
  const localDescription = `${course.title} i ${OSLO_LOCATION_NAME}. Vi tilbyr kurs for bedrifter og privatpersoner i ${OSLO_REGION_NAME}.`;
  const description = `${baseDescription.slice(0, 120)} ${localDescription}`.slice(0, 160);
  const localKeywords = buildOsloCourseKeywords(course.title, course.category, course.code);

  return {
    title: `${course.title} i ${OSLO_LOCATION_NAME} | KKS AS`,
    description,
    keywords: [
      course.title,
      `${course.title} kurs`,
      `${course.title} sertifisering`,
      course.category,
      "HMS kurs",
      "BHT kurs",
      "kurs Norge",
      ...localKeywords,
    ],
    authors: [{ name: "KKS AS" }],
    openGraph: {
      title: `${course.title} i ${OSLO_LOCATION_NAME} — KKS AS`,
      description,
      url: courseUrl,
      siteName: "KKS AS",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
      locale: "nb_NO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} i ${OSLO_LOCATION_NAME} — KKS AS`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: courseUrl,
    },
  };
}


