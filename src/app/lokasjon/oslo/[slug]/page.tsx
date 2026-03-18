import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { stripHtml } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { Metadata } from "next";
import { normalizeR2ImageUrl } from "@/lib/r2";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateBreadcrumbSchema,
  generateCourseSchema,
  generateFAQSchema,
  generateLocalBusinessSchema,
} from "@/lib/seo/schema";
import { getCourseCategoryLabel } from "@/lib/course-categories";
import { buildOsloCourseKeywords, OSLO_LOCATION_NAME, OSLO_REGION_NAME } from "@/lib/local-seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPublishedCourse(slug: string) {
  return db.course.findFirst({
    where: {
      slug,
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      code: true,
      category: true,
      description: true,
      durationDays: true,
      price: true,
      image: true,
      sessions: {
        where: {
          startsAt: { gte: new Date() },
          status: { in: ["OPEN", "DRAFT"] },
        },
        orderBy: { startsAt: "asc" },
        take: 12,
      },
    },
  });
}

export async function generateStaticParams() {
  const courses = await db.course.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const course = await getPublishedCourse(params.slug);
  if (!course) {
    return { title: "Kurs ikke funnet" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const courseUrl = `${baseUrl}/lokasjon/oslo/${course.slug}`;
  const normalizedImage = normalizeR2ImageUrl(course.image);
  const imageUrl = normalizedImage
    ? normalizedImage.startsWith("http")
      ? normalizedImage
      : `${baseUrl}${normalizedImage}`
    : `${baseUrl}/placeholder-kurs.jpg`;

  const shortDescription = course.description
    ? stripHtml(course.description).replace(/\s+/g, " ").trim().slice(0, 120)
    : `${course.title} i ${OSLO_LOCATION_NAME}.`;
  const description = `${shortDescription} Kurs i ${OSLO_LOCATION_NAME} og ${OSLO_REGION_NAME} for bedrift og privat.`.slice(0, 160);
  const localKeywords = buildOsloCourseKeywords(course.title, course.category, course.code);

  return {
    title: `${course.title} i ${OSLO_LOCATION_NAME} | KKS AS`,
    description,
    keywords: [...localKeywords, `${course.title} ${OSLO_REGION_NAME}`],
    alternates: {
      canonical: courseUrl,
    },
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
          alt: `${course.title} i ${OSLO_LOCATION_NAME}`,
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
  };
}

export default async function OsloCoursePage(props: PageProps) {
  const params = await props.params;
  const course = await getPublishedCourse(params.slug);
  if (!course) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const categoryLabel = getCourseCategoryLabel(course.category);
  const imageUrl = normalizeR2ImageUrl(course.image);
  const osloSessions = course.sessions.filter((session) => {
    const location = session.location.toLowerCase();
    return location.includes("oslo") || location.includes("akershus");
  });

  const faqs = [
    {
      question: `Tilbyr dere ${course.title} i ${OSLO_LOCATION_NAME}?`,
      answer: `Ja. KKS AS tilbyr ${course.title} i ${OSLO_LOCATION_NAME} og ${OSLO_REGION_NAME}. Vi tilbyr også bedriftsintern gjennomføring.`,
    },
    {
      question: `Hva koster ${course.title} i ${OSLO_LOCATION_NAME}?`,
      answer:
        course.price === 0
          ? `${course.title} er gratis. Kontakt oss for tilbud og neste gjennomføring i ${OSLO_LOCATION_NAME}.`
          : `${course.title} koster fra ${course.price.toLocaleString("nb-NO")} kr. Ta kontakt for bedriftspris i ${OSLO_REGION_NAME}.`,
    },
    {
      question: `Hvor lang tid tar ${course.title}?`,
      answer: `Kurset varer ${course.durationDays} ${course.durationDays === 1 ? "dag" : "dager"} og avsluttes med dokumentasjon/kompetansebevis.`,
    },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: "Kurs etter lokasjon", url: "/lokasjon" },
      { name: "Kurs i Oslo", url: "/lokasjon/oslo" },
      { name: `${course.title} i Oslo`, url: `/lokasjon/oslo/${course.slug}` },
    ],
    baseUrl
  );
  const faqSchema = generateFAQSchema(faqs);
  const localBusinessSchema = generateLocalBusinessSchema(
    baseUrl,
    "oslo",
    OSLO_LOCATION_NAME,
    OSLO_REGION_NAME
  );
  const courseSchema = generateCourseSchema(course as never, baseUrl);

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={[breadcrumbSchema, faqSchema, localBusinessSchema, courseSchema]} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/lokasjon/oslo">
            <Button variant="outline">Alle kurs i Oslo</Button>
          </Link>
          <Link href={`/kurs/${course.slug}`}>
            <Button variant="outline">Hovedside for kurset</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {imageUrl && (
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]">
                <img
                  src={imageUrl}
                  alt={`${course.title} i ${OSLO_LOCATION_NAME}`}
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}

            <Badge variant="secondary" className="mb-4">{categoryLabel}</Badge>
            <h1 className="text-4xl font-bold mb-4">{course.title} i {OSLO_LOCATION_NAME}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Kurs i {OSLO_LOCATION_NAME} og {OSLO_REGION_NAME} for bedrifter og privatpersoner.
            </p>

            <div className="flex items-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{course.durationDays} {course.durationDays === 1 ? "dag" : "dager"}</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {course.price === 0 ? "Gratis" : `${course.price.toLocaleString("nb-NO")} kr`}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{course.title} i Oslo-området</h2>
              <p className="text-muted-foreground">
                {course.description
                  ? stripHtml(course.description)
                  : `${course.title} leveres i ${OSLO_REGION_NAME} med sertifiserte instruktører.`}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Ofte stilte spørsmål om {course.title} i Oslo</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Kursdatoer i {OSLO_LOCATION_NAME}</CardTitle>
                <CardDescription>Finn neste tilgjengelige dato</CardDescription>
              </CardHeader>
              <CardContent>
                {osloSessions.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Ingen publiserte datoer i {OSLO_LOCATION_NAME} akkurat nå. Ta kontakt for rask oppsett i {OSLO_REGION_NAME}.
                    </p>
                    <Link href="/kontakt">
                      <Button className="w-full">Be om dato i Oslo</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {osloSessions.map((session) => (
                      <Card key={session.id}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>{format(session.startsAt, "d. MMMM yyyy", { locale: nb })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{session.location}</span>
                          </div>
                          <Link href={`/kurs/${course.slug}/pamelding/${session.id}`}>
                            <Button className="w-full mt-2">
                              Meld deg på
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
