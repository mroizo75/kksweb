import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, ArrowRight, BookOpen, Search, Phone, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { CourseRequestForm } from "@/components/public/CourseRequestForm";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateCourseListSchema, generateBreadcrumbSchema, generateDefinedTermSchema } from "@/lib/seo/schema";
import {
  courseCategoryOptions,
  getCourseCategoryLabel,
  primaryCourseCategoryCourseTerms,
  primaryCourseCategoryListText,
} from "@/lib/course-categories";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
const seoCourseCategoryTerms = primaryCourseCategoryCourseTerms.map((term) =>
  term.toLowerCase()
);
const seoCourseCategoryList = primaryCourseCategoryListText.toLowerCase();

export const metadata: Metadata = {
  title: `Alle kurs — ${primaryCourseCategoryListText} | KKS AS`,
  description:
    `Komplett kursoversikt fra KKS AS. Finn og meld deg på kurs innen ${seoCourseCategoryList}. Sertifiserte instruktører over hele Norge.`,
  keywords: [
    "kursoversikt",
    ...seoCourseCategoryTerms,
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
      `Finn og meld deg på kurs innen ${seoCourseCategoryList}. KKS AS — sertifiserte instruktører i hele Norge.`,
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
  let courses: Array<{
    id: string;
    title: string;
    slug: string;
    code: string;
    category: string;
    description: string | null;
    durationDays: number;
    price: number;
    image: string | null;
    sessions: Array<{
      startsAt: Date;
      location: string;
      capacity: number;
      _count: { enrollments: number };
    }>;
  }> = [];

  let categories: Array<{ category: string }> = [];

  try {
    [courses, categories] = await Promise.all([
      db.course.findMany({
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
      }),
      db.course.findMany({
        where: { published: true },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);
  } catch (error) {
    console.error("Feil ved lasting av /kurs:", error);
  }

  const categoriesFromCourses = new Set(categories.map((c) => c.category));
  const categoryOrder = new Map<string, number>(
    courseCategoryOptions.map((option, index) => [option.value, index])
  );
  const uniqueCategories = Array.from(categoriesFromCourses).sort((a, b) => {
    const orderA = categoryOrder.get(a) ?? Number.MAX_SAFE_INTEGER;
    const orderB = categoryOrder.get(b) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

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

  const activeCategory = category ?? null;

  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={[courseListSchema, breadcrumbSchema, ...definedTermSchemas]} />
      <Header />

      {/* Dark hero */}
      <section className="bg-slate-950 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <span>/</span>
            <span className="text-slate-300">Kurs</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-amber-400" />
              <span className="text-amber-400 font-semibold uppercase tracking-widest text-sm">Kursoversikt</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Alle kurs
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Finn og meld deg på kurs som passer for deg — sertifiserte instruktører i hele Norge.
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            <Link href="/kurs">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  !activeCategory
                    ? "bg-amber-400 text-slate-950 border-amber-400"
                    : "bg-transparent text-slate-300 border-slate-700 hover:border-amber-400 hover:text-amber-400"
                }`}
              >
                Alle
              </button>
            </Link>
            {uniqueCategories.map((cat) => (
              <Link key={cat} href={`/kurs?category=${cat}`}>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    activeCategory === cat
                      ? "bg-amber-400 text-slate-950 border-amber-400"
                      : "bg-transparent text-slate-300 border-slate-700 hover:border-amber-400 hover:text-amber-400"
                  }`}
                >
                  {getCourseCategoryLabel(cat)}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          {courses.length === 0 ? (
            <div className="max-w-2xl mx-auto py-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Ingen kurs lagt inn enda
                  {activeCategory && (
                    <span className="block text-lg text-slate-500 font-normal mt-1">
                      i kategorien «{getCourseCategoryLabel(activeCategory)}»
                    </span>
                  )}
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  Vi setter opp kurs etter behov. Send en forespørsel eller ring oss direkte —
                  så finner vi en dato som passer.
                </p>
              </div>

              {/* Quick contact */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <a
                  href="tel:+4791540824"
                  className="flex items-center gap-3 p-4 bg-slate-950 hover:bg-slate-800 rounded-xl text-white transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-slate-950" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ring oss</p>
                    <p className="font-bold text-sm">91 54 08 24</p>
                  </div>
                </a>
                <a
                  href="mailto:post@kksas.no"
                  className="flex items-center gap-3 p-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-900 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-300 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">E-post</p>
                    <p className="font-bold text-sm">post@kksas.no</p>
                  </div>
                </a>
              </div>

              {/* Request form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">
                    Send forespørsel om{" "}
                    {activeCategory
                      ? getCourseCategoryLabel(activeCategory).toLowerCase() + "-kurs"
                      : "kurs"}
                  </h3>
                </div>
                <CourseRequestForm
                  courseName={
                    activeCategory
                      ? `${getCourseCategoryLabel(activeCategory)}-kurs (forespørsel)`
                      : "Kurs (forespørsel fra /kurs)"
                  }
                  courseSlug={activeCategory ?? "kurs"}
                />
              </div>

              {/* Back link */}
              <div className="text-center mt-6">
                <Link href="/kurs" className="text-sm text-slate-500 hover:text-amber-600 transition-colors">
                  ← Vis alle kurs
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-8">
                {courses.length} {courses.length === 1 ? "kurs" : "kurs"} funnet
                {activeCategory ? ` i kategorien "${getCourseCategoryLabel(activeCategory)}"` : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const nextSession = course.sessions[0];
                  const availableSpots = nextSession
                    ? nextSession.capacity - nextSession._count.enrollments
                    : 0;
                  const isSoldOut = nextSession && availableSpots <= 0;
                  const isAlmostFull = nextSession && availableSpots > 0 && availableSpots <= 5;

                  return (
                    <Link
                      key={course.id}
                      href={`/kurs/${course.slug}`}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden"
                    >
                      {/* Category + price header */}
                      <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          {getCourseCategoryLabel(course.category)}
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {course.price === 0
                            ? "Gratis"
                            : `${course.price.toLocaleString("nb-NO")} kr`}
                        </span>
                      </div>

                      <div className="px-5 pb-4 flex-1 flex flex-col">
                        <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors leading-snug">
                          {course.title}
                        </h2>
                        {course.description && (
                          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                            {stripHtml(course.description)}
                          </p>
                        )}

                        <div className="space-y-1.5 text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <span>
                              {course.durationDays}{" "}
                              {course.durationDays === 1 ? "dag" : "dager"}
                            </span>
                          </div>

                          {nextSession && (
                            <>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                <span>
                                  Neste: {format(nextSession.startsAt, "d. MMM yyyy", { locale: nb })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{nextSession.location}</span>
                              </div>
                            </>
                          )}

                          {!nextSession && (
                            <p className="italic text-slate-400">Ingen kommende kurs planlagt</p>
                          )}
                        </div>

                        {nextSession && (
                          <div className="mb-4">
                            {isSoldOut ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                Fullt booket
                              </span>
                            ) : isAlmostFull ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                Kun {availableSpots} {availableSpots === 1 ? "plass" : "plasser"} igjen
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                {availableSpots} plasser ledig
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="px-5 pb-5">
                        <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950 text-white text-sm font-semibold group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                          Se detaljer og meld på
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-slate-950 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Trenger du kurs tilpasset din bedrift?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Vi stiller opp med instruktører hos dere — fleksible datoer, volumrabatt og sertifiserte kurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bedrift">
              <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold px-8">
                Bedriftsavtale
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/kontakt">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 px-8">
                Kontakt oss
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
