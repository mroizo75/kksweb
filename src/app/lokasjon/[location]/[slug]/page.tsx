import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { stripHtml } from "@/lib/utils";
import { normalizeR2ImageUrl } from "@/lib/r2";
import { getCourseCategoryLabel } from "@/lib/course-categories";
import { buildLocalCourseKeywords } from "@/lib/local-seo";
import { getSessionLocationKeywords } from "@/lib/location-matching";
import { locationConfig, supportedLocationSlugs, type LocationSlug } from "@/lib/locations";
import { getRelatedLocalCourseLinkGroups } from "@/lib/related-local-course-links";
import { StructuredData } from "@/components/seo/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generateBreadcrumbSchema,
  generateCourseSchema,
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateRelatedCourseItemListSchema,
} from "@/lib/seo/schema";

interface PageProps {
  params: Promise<{ location: string; slug: string }>;
}

async function getPublishedCourse(slug: string) {
  return db.course.findFirst({
    where: { slug, published: true },
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

function getLocationFromSlug(locationSlug: string) {
  return locationConfig[locationSlug as LocationSlug];
}

function filterSessionsByLocation<T extends { location: string }>(
  sessions: T[],
  locationSlug: string
): T[] {
  const keywords = getSessionLocationKeywords(locationSlug);
  if (keywords.length === 0) {
    return sessions;
  }

  return sessions.filter((session) => {
    const sessionLocation = session.location.toLowerCase();
    return keywords.some((keyword) => sessionLocation.includes(keyword));
  });
}

export async function generateStaticParams() {
  const sessions = await db.courseSession.findMany({
    where: {
      startsAt: { gte: new Date() },
      status: "OPEN",
      course: { published: true },
    },
    select: {
      location: true,
      course: { select: { slug: true } },
    },
  });

  const paramSet = new Set<string>();
  for (const session of sessions) {
    const locationText = session.location.toLowerCase();
    for (const locationSlug of supportedLocationSlugs) {
      const keywords = getSessionLocationKeywords(locationSlug);
      const isMatch = keywords.some((keyword) => locationText.includes(keyword));
      if (isMatch) {
        paramSet.add(`${locationSlug}:${session.course.slug}`);
      }
    }
  }

  return Array.from(paramSet).flatMap((entry) => {
    const [location, slug] = entry.split(":");
    if (!location || !slug) {
      return [];
    }
    return [{ location, slug }];
  });
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const location = getLocationFromSlug(params.location);
  if (!location) {
    return { title: "Lokasjon ikke funnet" };
  }

  const course = await getPublishedCourse(params.slug);
  if (!course) {
    return { title: "Kurs ikke funnet" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const localUrl = `${baseUrl}/lokasjon/${params.location}/${course.slug}`;
  const localSessions = filterSessionsByLocation(course.sessions, params.location);
  const hasLocalSessions = localSessions.length > 0;
  const normalizedImage = normalizeR2ImageUrl(course.image);
  const imageUrl = normalizedImage
    ? normalizedImage.startsWith("http")
      ? normalizedImage
      : `${baseUrl}${normalizedImage}`
    : `${baseUrl}/placeholder-kurs.jpg`;

  const shortDescription = course.description
    ? stripHtml(course.description).replace(/\s+/g, " ").trim().slice(0, 120)
    : `${course.title} i ${location.name}.`;
  const description = `${shortDescription} Kurs i ${location.name} og ${location.region} for bedrift og privat.`.slice(0, 160);
  const localKeywords = buildLocalCourseKeywords(
    course.title,
    course.category,
    course.code,
    location.name,
    location.region
  );

  return {
    title: `${course.title} i ${location.name} | KKS AS`,
    description,
    keywords: [...localKeywords, `${course.title} ${location.region}`],
    alternates: { canonical: localUrl },
    robots: hasLocalSessions ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${course.title} i ${location.name} — KKS AS`,
      description,
      url: localUrl,
      siteName: "KKS AS",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${course.title} i ${location.name}`,
        },
      ],
      locale: "nb_NO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} i ${location.name} — KKS AS`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function LocationCoursePage(props: PageProps) {
  const params = await props.params;
  const location = getLocationFromSlug(params.location);
  if (!location) {
    notFound();
  }

  const course = await getPublishedCourse(params.slug);
  if (!course) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const categoryLabel = getCourseCategoryLabel(course.category);
  const imageUrl = normalizeR2ImageUrl(course.image);
  const localSessions = filterSessionsByLocation(course.sessions, params.location);
  const relatedLocalLinkGroups = await getRelatedLocalCourseLinkGroups({
    currentCourseId: course.id,
    category: course.category,
    preferredLocationSlug: params.location,
    maxLocations: 6,
    maxLinksPerLocation: 2,
  });

  const faqs = [
    {
      question: `Tilbyr dere ${course.title} i ${location.name}?`,
      answer: `Ja. KKS AS tilbyr ${course.title} i ${location.name} og ${location.region}. Vi tilbyr også bedriftsintern gjennomføring.`,
    },
    {
      question: `Hva koster ${course.title} i ${location.name}?`,
      answer:
        course.price === 0
          ? `${course.title} er gratis. Kontakt oss for tilbud og neste gjennomføring i ${location.name}.`
          : `${course.title} koster fra ${course.price.toLocaleString("nb-NO")} kr. Ta kontakt for bedriftspris i ${location.region}.`,
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
      { name: `Kurs i ${location.name}`, url: `/lokasjon/${params.location}` },
      { name: `${course.title} i ${location.name}`, url: `/lokasjon/${params.location}/${course.slug}` },
    ],
    baseUrl
  );
  const faqSchema = generateFAQSchema(faqs);
  const localBusinessSchema = generateLocalBusinessSchema(
    baseUrl,
    params.location,
    location.name,
    location.region
  );
  const courseSchema = generateCourseSchema(course as never, baseUrl);
  const relatedCourseSchemaItems = relatedLocalLinkGroups.flatMap((group) =>
    group.links.map((link) => ({
      name: `${link.courseTitle} i ${group.locationName}`,
      url: link.href,
    }))
  );
  const relatedCourseItemListSchema = relatedCourseSchemaItems.length > 0
    ? generateRelatedCourseItemListSchema(
        relatedCourseSchemaItems,
        baseUrl,
        `Relaterte ${categoryLabel.toLowerCase()}-kurs for ${location.name}`,
        `Lokal oversikt over relaterte ${categoryLabel.toLowerCase()}-kurs i norske byer`
      )
    : null;

  return (
    <div className="min-h-screen bg-background">
      <StructuredData
        data={
          relatedCourseItemListSchema
            ? [breadcrumbSchema, faqSchema, localBusinessSchema, courseSchema, relatedCourseItemListSchema]
            : [breadcrumbSchema, faqSchema, localBusinessSchema, courseSchema]
        }
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link href={`/lokasjon/${params.location}`}>
            <Button variant="outline">Alle kurs i {location.name}</Button>
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
                  alt={`${course.title} i ${location.name}`}
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}

            <Badge variant="secondary" className="mb-4">{categoryLabel}</Badge>
            <h1 className="text-4xl font-bold mb-4">{course.title} i {location.name}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Kurs i {location.name} og {location.region} for bedrifter og privatpersoner.
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
              <h2 className="text-2xl font-bold mb-4">{course.title} i {location.name}-området</h2>
              <p className="text-muted-foreground">
                {course.description
                  ? stripHtml(course.description)
                  : `${course.title} leveres i ${location.region} med sertifiserte instruktører.`}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Ofte stilte spørsmål om {course.title} i {location.name}</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {relatedLocalLinkGroups.length > 0 && (
              <div className="mb-8 rounded-xl border p-6">
                <h2 className="text-2xl font-bold mb-4">
                  Relaterte {categoryLabel.toLowerCase()}-kurs etter by
                </h2>
                <p className="text-muted-foreground mb-4">
                  Se lignende kurs i samme kategori med lokal tilpasning og ledige datoer.
                </p>
                <div className="space-y-4">
                  {relatedLocalLinkGroups.map((group) => (
                    <div key={group.locationSlug}>
                      <h3 className="font-semibold mb-2">{group.locationName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.links.map((link) => (
                          <Link key={`${group.locationSlug}-${link.courseSlug}`} href={link.href}>
                            <Button variant="outline" size="sm">
                              {link.courseTitle} i {group.locationName}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Kursdatoer i {location.name}</CardTitle>
                <CardDescription>Finn neste tilgjengelige dato</CardDescription>
              </CardHeader>
              <CardContent>
                {localSessions.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Ingen publiserte datoer i {location.name} akkurat nå. Ta kontakt for rask oppsett i {location.region}.
                    </p>
                    <Link href="/kontakt">
                      <Button className="w-full">Be om dato i {location.name}</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localSessions.map((session) => (
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
