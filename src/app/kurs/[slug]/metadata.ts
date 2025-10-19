import { Metadata } from "next";
import { db } from "@/lib/db";
import {
  generateCourseSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schema";

export async function generateCourseMetadata(slug: string): Promise<Metadata> {
  const course = await db.course.findUnique({
    where: { slug },
    include: {
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kkskurs.no";
  const courseUrl = `${baseUrl}/kurs/${course.slug}`;
  const imageUrl = course.image
    ? course.image.startsWith("http")
      ? course.image
      : `${baseUrl}${course.image}`
    : `${baseUrl}/placeholder-kurs.jpg`;

  // Generer alle schemas
  const courseSchema = generateCourseSchema(course, baseUrl);
  const productSchema = generateProductSchema(course, baseUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: "Kurs", url: "/kurs" },
      { name: course.title, url: `/kurs/${course.slug}` },
    ],
    baseUrl
  );

  const description =
    course.description ||
    `${course.title} - Profesjonell kursing fra KKS. ${
      course.durationDays
    } dager. Fra kr ${course.price},-. ${
      course.sessions.length
    } kommende sesjoner.`;

  return {
    title: `${course.title} - Profesjonell Kursing | KKS`,
    description,
    keywords: [
      course.title,
      "kurs",
      "kompetanse",
      "sertifisering",
      course.category,
      "HMS",
      "BHT",
      "Norge",
      course.code,
    ],
    authors: [{ name: "KKS AS AS" }],
    openGraph: {
      title: `${course.title} - KKS Kurs`,
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
      title: `${course.title} - KKS Kurs`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: courseUrl,
    },
    other: {
      "course:price:amount": course.price.toString(),
      "course:price:currency": "NOK",
      "course:duration": `${course.durationDays} dager`,
    },
    // Schema.org structured data
    // Dette brukes av Next.js 15 App Router
    // Men vi legger også til manuelt i components
  };
}

