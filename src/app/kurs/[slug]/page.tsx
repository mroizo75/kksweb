import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { generateCourseMetadata } from "./metadata";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateCourseSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateRelatedCourseItemListSchema,
} from "@/lib/seo/schema";
import { parseCourseBookingAddOns } from "@/lib/booking-add-ons";
import { normalizeR2ImageUrl } from "@/lib/r2";
import { getCourseCategoryLabel } from "@/lib/course-categories";
import { locationConfig, supportedLocationSlugs } from "@/lib/locations";
import { getRelatedLocalCourseLinkGroups } from "@/lib/related-local-course-links";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { CourseRequestForm } from "@/components/public/CourseRequestForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  return generateCourseMetadata(params.slug);
}

export default async function CourseDetailPage(props: PageProps) {
  const params = await props.params;
  const course = await db.course.findUnique({
    where: { slug: params.slug },
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
      published: true,
      learningOutcomes: true,
      targetAudience: true,
      priceIncludes: true,
      createdAt: true,
      updatedAt: true,
      validityYears: true,
      validityPolicyId: true,
      bookingAddOns: true,
      sessions: {
        where: {
          startsAt: { gte: new Date() },
          status: { in: ["OPEN", "DRAFT"] },
        },
        orderBy: { startsAt: "asc" },
        include: {
          instructor: {
            select: { name: true },
          },
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
  });

  if (!course) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const courseImage = normalizeR2ImageUrl(course.image);
  const bookingAddOns = parseCourseBookingAddOns(
    (course as { bookingAddOns?: unknown }).bookingAddOns
  ).map((addOn) => ({
    ...addOn,
    image: normalizeR2ImageUrl(addOn.image),
  }));
  const categoryLabel = getCourseCategoryLabel(course.category);
  const relatedLocalLinkGroups = await getRelatedLocalCourseLinkGroups({
    currentCourseId: course.id,
    category: course.category,
    maxLocations: 6,
    maxLinksPerLocation: 2,
  });

  const learningOutcomes: string[] = course.learningOutcomes
    ? (JSON.parse(course.learningOutcomes) as string[])
    : [
        "Grunnleggende sikkerhetsprosedyrer og lovkrav",
        "Praktisk opplæring med erfarne instruktører",
        "Teoretisk og praktisk eksamen",
        "Offisielt kompetansebevis ved bestått",
      ];

  const courseFaqs = [
    {
      question: `Hva er ${course.title}?`,
      answer: course.description
        ? stripHtml(course.description).slice(0, 300).trim() + (stripHtml(course.description).length > 300 ? "..." : "")
        : `${course.title} er et profesjonelt kurs fra KKS AS som gir deg nødvendig kompetanse og sertifisering.`,
    },
    {
      question: `Hvor lang tid tar ${course.title}?`,
      answer: `Kurset varer ${course.durationDays} ${course.durationDays === 1 ? "dag" : "dager"}. Du får et offisielt kursbevis ved bestått eksamen.`,
    },
    {
      question: `Hva koster ${course.title}?`,
      answer: course.price === 0
        ? `${course.title} er gratis. Kontakt oss for mer informasjon.`
        : `${course.title} koster kr ${course.price.toLocaleString("nb-NO")},-. Prisen inkluderer ${course.priceIncludes ?? "kursmateriell og kursbevis"}.`,
    },
    {
      question: `Hvem tilbyr ${course.title} i Norge?`,
      answer: `KKS AS tilbyr ${course.title} i hele Norge. Vi har sertifiserte instruktører og kan komme til din bedrift. Ring oss på +47 91 54 08 24 eller send e-post til post@kksas.no.`,
    },
    {
      question: `Får jeg kursbevis etter ${course.title}?`,
      answer: `Ja. Etter bestått ${course.title} mottar du et offisielt kompetansebevis fra KKS AS som dokumenterer din sertifisering.`,
    },
    {
      question: `Tilbyr dere ${course.title} over hele Norge?`,
      answer: `Ja. KKS AS tilbyr ${course.title} i hele Norge og kan gjennomføre kurset hos din bedrift eller i innleid kurslokale.`,
    },
  ];

  const courseSchema = generateCourseSchema(course as any, baseUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: "Kurs", url: "/kurs" },
      { name: course.title, url: `/kurs/${course.slug}` },
    ],
    baseUrl
  );
  const faqSchema = generateFAQSchema(courseFaqs);
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
        `Relaterte ${categoryLabel.toLowerCase()}-kurs etter lokasjon`,
        `Relaterte ${categoryLabel.toLowerCase()}-kurs med lokale landingssider`
      )
    : null;

  return (
    <div className="min-h-screen bg-white">
      <StructuredData
        data={
          relatedCourseItemListSchema
            ? [courseSchema, breadcrumbSchema, faqSchema, relatedCourseItemListSchema]
            : [courseSchema, breadcrumbSchema, faqSchema]
        }
      />
      <Header />

      {/* Dark hero */}
      <section
        className="relative bg-slate-950 pt-24 pb-16 overflow-hidden"
        style={
          courseImage
            ? {
                backgroundImage: `url(${courseImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {courseImage && (
          <div className="absolute inset-0 bg-slate-950/80" />
        )}
        <div className="relative container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/kurs" className="hover:text-amber-400 transition-colors">Kurs</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300 truncate max-w-xs">{course.title}</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
              {categoryLabel}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-slate-300 text-sm">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                {course.durationDays} {course.durationDays === 1 ? "dag" : "dager"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-lg">
                  {course.price === 0
                    ? "Gratis"
                    : `${course.price.toLocaleString("nb-NO")} kr`}
                </span>
              </span>
              {course.sessions.length > 0 && (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Calendar className="h-4 w-4" />
                  {course.sessions.length} kommende{" "}
                  {course.sessions.length === 1 ? "dato" : "datoer"}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            {course.description && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Om kurset</h2>
                <div
                  className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </div>
            )}

            {/* No sessions — full request form in main content */}
            {course.sessions.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Ingen datoer lagt inn enda — send forespørsel
                    </h2>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                      Vi har ikke planlagt noen datoer for <strong>{course.title}</strong> enda,
                      men vi setter opp kurs etter behov. Fyll ut skjemaet under, så tar vi
                      kontakt innen 1–2 virkedager for å avtale en dato som passer deg.
                    </p>
                  </div>
                </div>
                <CourseRequestForm courseName={course.title} courseSlug={course.slug} />
              </div>
            )}

            {/* Learning outcomes */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hva du lærer</h2>
              <ul className="space-y-3">
                {learningOutcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target audience */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Hvem bør ta kurset</h2>
              <p className="text-slate-600 leading-relaxed">
                {course.targetAudience ||
                  `${course.title} passer for deg som skal jobbe med, eller allerede jobber med, ${categoryLabel.toLowerCase()}-relaterte oppgaver i din arbeidshverdag. Kurset er relevant for ansatte i bygg, industri, anlegg og logistikk.`}
              </p>
            </div>

            {/* Price includes */}
            {course.priceIncludes && (
              <div className="border border-amber-200 bg-amber-50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Hva er inkludert</h2>
                <p className="text-slate-700">{course.priceIncludes}</p>
              </div>
            )}

            {/* Locations */}
            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {course.title} — velg by
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                Vi leverer {course.title} i hele Norge. Velg nærmeste storby for lokal informasjon og tilgjengelige datoer.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {supportedLocationSlugs.map((locationSlug) => (
                  <Link key={locationSlug} href={`/lokasjon/${locationSlug}/${course.slug}`}>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-amber-400 hover:text-amber-700 text-slate-700 text-sm font-medium transition-all">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                      {course.title} i {locationConfig[locationSlug].name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related local courses */}
            {relatedLocalLinkGroups.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Relaterte {categoryLabel.toLowerCase()}-kurs per by
                </h2>
                <p className="text-slate-500 text-sm mb-5">
                  Utforsk lignende kurs i samme kategori med lokal informasjon og tilgjengelige datoer.
                </p>
                <div className="space-y-4">
                  {relatedLocalLinkGroups.map((group) => (
                    <div key={group.locationSlug}>
                      <h3 className="font-semibold text-slate-800 mb-2 text-sm">{group.locationName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.links.map((link) => (
                          <Link
                            key={`${group.locationSlug}-${link.courseSlug}`}
                            href={link.href}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 hover:border-amber-400 hover:text-amber-700 text-slate-600 transition-all"
                          >
                            {link.courseTitle} i {group.locationName}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Ofte stilte spørsmål</h2>
              <div className="space-y-4">
                {courseFaqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-amber-300 transition-colors">
                    <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-slate-950 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <p className="text-white font-semibold mb-1">Trenger du hjelp eller har spørsmål?</p>
                <p className="text-slate-400 text-sm">Kontakt oss — vi svarer raskt</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:+4791540824">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 w-full sm:w-auto">
                    <Phone className="h-3.5 w-3.5 mr-2" />
                    91 54 08 24
                  </Button>
                </a>
                <a href="mailto:post@kksas.no">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 w-full sm:w-auto">
                    <Mail className="h-3.5 w-3.5 mr-2" />
                    E-post
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Sticky sidebar — sessions & price */}
          <div>
            <div className="sticky top-24 space-y-4">
              {/* Price box */}
              <div className="bg-slate-950 rounded-2xl p-6 text-white">
                <p className="text-slate-400 text-sm mb-1">Pris per deltaker</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {course.price === 0
                    ? "Gratis"
                    : `${course.price.toLocaleString("nb-NO")} kr`}
                </p>
                {course.priceIncludes && (
                  <p className="text-slate-400 text-xs mt-2">{course.priceIncludes}</p>
                )}
                {bookingAddOns.length > 0 && (
                  <p className="text-amber-400 text-xs mt-2">
                    + tillegg fra {Math.min(...bookingAddOns.map((a) => a.price)).toLocaleString("nb-NO")} kr
                  </p>
                )}
              </div>

              {/* Sessions */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                  <h2 className="font-bold text-slate-900">Kommende datoer</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Velg en dato som passer</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {course.sessions.length === 0 ? (
                    <div className="px-5 py-5">
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Ingen datoer lagt inn enda
                      </p>
                      <p className="text-xs text-slate-500 mb-4">
                        Send en forespørsel — vi setter opp dato for deg.
                      </p>
                      <CourseRequestForm
                        courseName={course.title}
                        courseSlug={course.slug}
                        compact
                      />
                    </div>
                  ) : (
                    course.sessions.map((session) => {
                      const availableSpots =
                        session.capacity - session._count.enrollments;
                      const isFull = availableSpots <= 0;
                      const isAlmostFull = availableSpots > 0 && availableSpots <= 3;

                      return (
                        <div key={session.id} className="px-5 py-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {format(session.startsAt, "EEEE d. MMMM", { locale: nb })}
                              </p>
                              <p className="text-slate-500 text-xs mt-0.5">
                                {format(session.startsAt, "HH:mm", { locale: nb })} •{" "}
                                {session.location}
                              </p>
                            </div>
                            {isFull ? (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                Fullt
                              </span>
                            ) : isAlmostFull ? (
                              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                {availableSpots} igjen
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                <Users className="inline h-3 w-3 mr-0.5" />
                                {availableSpots}
                              </span>
                            )}
                          </div>

                          {session.instructor && (
                            <p className="text-xs text-slate-400 mb-3">
                              Instruktør: {session.instructor.name}
                            </p>
                          )}

                          <Link
                            href={`/kurs/${course.slug}/pamelding/${session.id}`}
                            className="block"
                          >
                            <Button
                              className={`w-full text-sm ${
                                isFull
                                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                  : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
                              }`}
                              disabled={isFull}
                            >
                              {isFull ? "Fullt booket" : "Meld deg på"}
                            </Button>
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Trenger du {course.title} på en annen dato eller lokasjon?{" "}
                    <a href="mailto:post@kksas.no" className="text-amber-600 hover:underline font-medium">
                      Kontakt oss
                    </a>
                  </p>
                </div>
              </div>

              {/* Back to listing */}
              <Link href="/kurs">
                <Button variant="outline" className="w-full text-sm border-slate-200 text-slate-600 hover:border-slate-300">
                  <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                  Alle kurs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
