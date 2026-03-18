import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { stripHtml } from "@/lib/utils";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schema";
import { normalizeR2ImageUrl } from "@/lib/r2";
import { getCourseCategoryLabel, primaryCourseCategoryListText } from "@/lib/course-categories";
import { buildSessionLocationOrFilter } from "@/lib/location-matching";
import { locationConfig, supportedLocationSlugs, type LocationSlug } from "@/lib/locations";

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const location = locationConfig[params.location as LocationSlug];

  if (!location) {
    return {
      title: "Lokasjon ikke funnet",
    };
  }

  const locationSessionOrFilter = buildSessionLocationOrFilter(params.location);
  const openLocalSessionsCount = await db.courseSession.count({
    where: {
      startsAt: { gte: new Date() },
      status: "OPEN",
      ...(locationSessionOrFilter.length > 0 && { OR: locationSessionOrFilter }),
    },
  });

  return {
    title: `Kurs i ${location.name} - ${primaryCourseCategoryListText} | KKS AS`,
    description: `${location.about.substring(0, 155)}`,
    keywords: location.keywords,
    robots: openLocalSessionsCount > 0 ? undefined : { index: false, follow: true },
    openGraph: {
      title: `Kurs i ${location.name} - KKS AS`,
      description: location.description,
      url: `https://www.kksas.no/lokasjon/${params.location}`,
    },
  };
}

export async function generateStaticParams() {
  return supportedLocationSlugs.map((location) => ({
    location,
  }));
}

export default async function LocationPage(props: PageProps) {
  const params = await props.params;
  const location = locationConfig[params.location as LocationSlug];

  if (!location) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const locationSessionOrFilter = buildSessionLocationOrFilter(params.location);

  const locationFaqs = [
    {
      question: `Hvor holder dere kurs i ${location.name}?`,
      answer: `Vi kommer gjerne ut til din bedrift hvis dere har egnede lokaler. Hvis ikke, leier vi et kurslokale i nærheten av deres adresse i ${location.region}.`,
    },
    {
      question: `Hvor lang tid tar et typisk kurs i ${location.name}?`,
      answer: `Kurslengden varierer fra 1 til 5 dager avhengig av kurstype. Se kursoversikten for detaljer om hvert enkelt kurs.`,
    },
    {
      question: `Tilbyr dere bedriftsavtaler i ${location.name}?`,
      answer: `Ja. KKS AS tilbyr skreddersydde løsninger for bedrifter i ${location.region}. Kontakt oss på ${location.phone} eller ${location.email} for tilbud.`,
    },
    {
      question: `Hvilke kurs tilbyr KKS AS i ${location.name}?`,
      answer: `KKS AS tilbyr truck-, kran-, stillas-, HMS- og BHT-kurs i ${location.name}. Vi har sertifiserte instruktører og kan tilpasse kurset til din bransje og lokasjon.`,
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema(
    baseUrl,
    params.location,
    location.name,
    location.region
  );
  const faqSchema = generateFAQSchema(locationFaqs);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: "Kurs etter lokasjon", url: "/lokasjon" },
      { name: `Kurs i ${location.name}`, url: `/lokasjon/${params.location}` },
    ],
    baseUrl
  );

  // Hent kommende sesjoner (kan filtreres på lokasjon senere)
  const sessions = await db.courseSession.findMany({
    where: {
      startsAt: { gte: new Date() },
      status: "OPEN",
      ...(locationSessionOrFilter.length > 0 && { OR: locationSessionOrFilter }),
    },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
          category: true,
          price: true,
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: 6,
  });

  // Hent alle kurs for visning
  const courses = await db.course.findMany({
    where: {
      published: true,
      sessions: {
        some: {
          startsAt: { gte: new Date() },
          status: "OPEN",
          ...(locationSessionOrFilter.length > 0 && { OR: locationSessionOrFilter }),
        },
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      description: true,
      price: true,
      image: true,
    },
    orderBy: { title: "asc" },
    take: 8,
  });

  return (
    <div className="min-h-screen">
      <StructuredData data={[localBusinessSchema, faqSchema, breadcrumbSchema]} />
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <MapPin className="h-3 w-3 mr-1" />
              {location.region}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kurs i {location.name}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              {location.heroText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
                <a href="#kurs">
                  Se våre kurs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <a href="#kontakt">
                  Kontakt oss
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Om KKS AS i {location.name}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-8">
              {location.about}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {location.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="kurs" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Våre kurs i {location.name}
          </h2>
          {courses.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Ingen åpne kurssesjoner i {location.name} akkurat nå. Kontakt oss for rask oppstart i {location.region}.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  {course.image && (
                    <div className="overflow-hidden rounded-t-lg relative aspect-[4/3] sm:aspect-[16/10]">
                      <img
                        src={normalizeR2ImageUrl(course.image)}
                        alt={course.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {getCourseCategoryLabel(course.category)}
                    </Badge>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description ? stripHtml(course.description).substring(0, 120) : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        {course.price === 0 ? "Gratis" : `${course.price.toLocaleString("nb-NO")} kr`}
                      </span>
                    </div>
                    <Link
                      href={`/lokasjon/${params.location}/${course.slug}`}
                      title={`${course.title} i ${location.name}`}
                    >
                      <Button className="w-full mt-4">
                        Les mer om {course.title} i {location.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/kurs">
                Se alle kurs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="py-12 border-t bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Kurshub {location.name}: raske lenker
              </h2>
              <p className="text-muted-foreground mb-6">
                Direkte lenker til kurs i {location.name} og {location.region}. Bruk disse for rask navigasjon til riktig kurs.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/lokasjon/${params.location}/${course.slug}`}
                    className="rounded-lg border bg-background px-4 py-3 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                  >
                    {course.title} i {location.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Sessions */}
      {sessions.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Kommende kursdatoer
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{session.course.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(session.startsAt, "EEEE d. MMMM yyyy", { locale: nb })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/kurs/${session.course.slug}/pamelding/${session.id}`}>
                      <Button className="w-full">
                        Meld deg på
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="kontakt" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">
                  Kontakt oss i {location.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  Har du spørsmål om våre kurs i {location.name}? Vi hjelper deg gjerne!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <a href={`tel:${location.phone}`} className="text-primary hover:underline">
                        {location.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">E-post</p>
                      <a href={`mailto:${location.email}`} className="text-primary hover:underline">
                        {location.email}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1" asChild>
                    <Link href="/kontakt">
                      Send melding
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1" asChild>
                    <Link href="/bedrift">
                      Bedriftsavtale
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Ofte stilte spørsmål i {location.name}
            </h2>
            <div className="space-y-4">
              {locationFaqs.map((faq, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

