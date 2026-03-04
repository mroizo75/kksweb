import { Metadata } from "next";
import { db } from "@/lib/db";

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const courseUrl = `${baseUrl}/kurs/${course.slug}`;
  const imageUrl = course.image
    ? course.image.startsWith("http")
      ? course.image
      : `${baseUrl}${course.image}`
    : `${baseUrl}/placeholder-kurs.jpg`;

  const description =
    course.description?.substring(0, 160) ||
    `${course.title} — Profesjonell kursing fra KKS AS. ${course.durationDays} ${
      course.durationDays === 1 ? "dag" : "dager"
    }. Fra kr ${course.price.toLocaleString("nb-NO")},-. Meld deg på i dag.`;

  return {
    title: `${course.title} | KKS AS`,
    description,
    keywords: [
      course.title,
      `${course.title} kurs`,
      `${course.title} sertifisering`,
      course.category,
      "HMS kurs",
      "BHT kurs",
      "kurs Norge",
      course.code,
    ],
    authors: [{ name: "KKS AS" }],
    openGraph: {
      title: `${course.title} — KKS AS`,
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
      title: `${course.title} — KKS AS`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: courseUrl,
    },
  };
}


