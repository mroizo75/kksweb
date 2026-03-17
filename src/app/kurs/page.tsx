import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateCourseListSchema, generateBreadcrumbSchema, generateDefinedTermSchema } from "@/lib/seo/schema";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "Alle kurs — Truck, Kran, Stillas, HMS og BHT | KKS AS",
  description:
    "Komplett kursoversikt fra KKS AS. Finn og meld deg på kurs innen truck, kran, stillas, arbeid på vei, HMS og BHT-opplæring. Sertifiserte instruktører over hele Norge.",
  keywords: [
    "kursoversikt",
    "truckkurs",
    "krankurs",
    "stillasmontørkurs",
    "HMS kurs",
    "BHT kurs",
    "arbeid på vei kurs",
    "maskinførerkurs",
    "kurs Norge",
    "sertifisering",
  ],
  alternates: {
    canonical: `${BASE_URL}/kurs`,
  },
  openGraph: {
    title: "Alle kurs — KKS AS",
    description:
      "Finn og meld deg på kurs innen truck, kran, stillas, HMS og mer. KKS AS — sertifiserte instruktører i hele Norge.",
    url: `${BASE_URL}/kurs`,
    siteName: "KKS AS",
    locale: "nb_NO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function CoursesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { category, search } = searchParams;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

  const courses = await db.course.findMany({
    where: {
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { code: { contains: search } },
        ],
      }),
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
          status: { in: ["OPEN"] },
        },
        orderBy: { startsAt: "asc" },
        take: 1,
        include: {
          _count: {
            select: {
              enrollments: {
                where: {
                  status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { title: "asc" },
  });

  const categories = await db.course.findMany({
    where: { published: true },
    select: { category: true },
    distinct: ["category"],
  });

  const uniqueCategories = categories.map((c) => c.category);

  const courseListSchema = generateCourseListSchema(courses, baseUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: "Kurs", url: "/kurs" },
    ],
    baseUrl
  );
  const definedTermSchemas = generateDefinedTermSchema([
    {
      name: "Truckfører (T1–T8)",
      description: "Sertifisert truckfører i Norge må gjennomføre godkjent truckfører kurs (T1–T8) i henhold til Arbeidstilsynets krav. Kursene dekker ulike trucktyper: T1 (motvektstruck), T2 (reachtruck), T4 (teleskoptruck) osv. KKS AS er godkjent leverandør av truckfører-opplæring.",
    },
    {
      name: "Kranfører (G4, G8, G11)",
      description: "Kranfører-sertifisering i Norge krever godkjent opplæring i henhold til FOR-2009-06-01-607. G4 er traverskran, G8 er lastebilmontert kran og G11 er løfteredskap. KKS AS tilbyr kurs i alle kranklasser.",
    },
    {
      name: "HMS grunnkurs",
      description: "HMS grunnkurs er lovpålagt for verneombud og ledere med personalansvar i norske virksomheter, jf. arbeidsmiljøloven § 3-5 og § 6-5. Kurset er 40 timer og dekker arbeidsmiljølovgivning, risikovurdering og systematisk HMS-arbeid.",
    },
    {
      name: "Stillasmontørkurs",
      description: "Stillasopplæring er krav etter Byggherreforskriften og FOR-2011-12-19-1355. Kurs for stillasmontør dekker stillas inntil 2 meter, 2–9 meter og over 9 meter. KKS AS tilbyr alle nivåer.",
    },
    {
      name: "BHT (Bedriftshelsetjeneste)",
      description: "Bedriftshelsetjeneste (BHT) er lovpålagt for mange norske virksomheter etter arbeidsmiljøloven § 3-3. KKS AS tilbyr obligatorisk BHT-kurs og BHT-medlemskapsprogram via Dr Dropin.",
    },
    {
      name: "Arbeid på vei",
      description: "Arbeid på og ved veg krever godkjent opplæring i henhold til Statens vegvesens krav og Vegtrafikklovens bestemmelser. KKS AS tilbyr kurs i arbeidsvarsling og arbeid på vei.",
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={[courseListSchema, breadcrumbSchema, ...definedTermSchemas]} />
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Alle kurs</h1>
          <p className="text-lg text-muted-foreground">
            Finn og meld deg på kurs som passer for deg
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/kurs">
            <Button variant={!category ? "default" : "outline"} size="sm">
              Alle
            </Button>
          </Link>
          {uniqueCategories.map((cat) => (
            <Link key={cat} href={`/kurs?category=${cat}`}>
              <Button
                variant={category === cat ? "default" : "outline"}
                size="sm"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            </Link>
          ))}
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Ingen kurs funnet. Prøv en annen kategori.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const nextSession = course.sessions[0];
              const availableSpots = nextSession
                ? nextSession.capacity - nextSession._count.enrollments
                : 0;

              return (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{course.category}</Badge>
                      <span className="text-sm font-bold text-primary">
                        {course.price === 0
                          ? "Gratis"
                          : `${course.price.toLocaleString("nb-NO")} kr`}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description ? stripHtml(course.description) : "Ingen beskrivelse"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {course.durationDays}{" "}
                          {course.durationDays === 1 ? "dag" : "dager"}
                        </span>
                      </div>

                      {nextSession && (
                        <>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Neste: {format(nextSession.startsAt, "d. MMM yyyy", { locale: nb })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{nextSession.location}</span>
                          </div>
                          <div className="mt-4">
                            <Badge
                              variant={availableSpots > 5 ? "default" : "destructive"}
                            >
                              {availableSpots > 0
                                ? `${availableSpots} ${availableSpots === 1 ? "plass" : "plasser"} ledig`
                                : "Fullt booket"}
                            </Badge>
                          </div>
                        </>
                      )}

                      {!nextSession && (
                        <p className="text-muted-foreground italic">
                          Ingen kommende kurs planlagt
                        </p>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link href={`/kurs/${course.slug}`} className="w-full">
                      <Button className="w-full">
                        Se detaljer og meld på
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

