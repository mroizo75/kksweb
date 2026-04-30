import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { stripHtml } from "@/lib/utils";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Clock,
} from "lucide-react";
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
import { getCourseCategoryLabel } from "@/lib/course-categories";
import { buildSessionLocationOrFilter } from "@/lib/location-matching";
import { locationConfig, supportedLocationSlugs, type LocationSlug } from "@/lib/locations";

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const location = locationConfig[params.location as LocationSlug];

  if (!location) {
    return { title: "Lokasjon ikke funnet" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
  const canonicalUrl = `${baseUrl}/lokasjon/${params.location}`;
  const description = `${location.about.substring(0, 155)}`;

  return {
    title: `Kurs i ${location.name} — Truck, Kran, HMS og mer | KKS AS`,
    description,
    keywords: location.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Kurs i ${location.name} — KKS AS`,
      description,
      url: canonicalUrl,
      type: "website",
      locale: "nb_NO",
      siteName: "KKS AS",
    },
  };
}

export async function generateStaticParams() {
  return supportedLocationSlugs.map((location) => ({ location }));
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
    location.region,
    {
      serviceArea: [...location.serviceArea],
      geo: location.geo,
    }
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

  const sessions = await db.courseSession.findMany({
    where: {
      startsAt: { gte: new Date() },
      status: "OPEN",
      ...(locationSessionOrFilter.length > 0 && { OR: locationSessionOrFilter }),
    },
    include: {
      course: {
        select: { title: true, slug: true, category: true, price: true },
      },
    },
    orderBy: { startsAt: "asc" },
    take: 6,
  });

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
    <div className="min-h-screen bg-white">
      <StructuredData data={[localBusinessSchema, faqSchema, breadcrumbSchema]} />
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-400">Kurs etter lokasjon</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">{location.name}</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-amber-400/20 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-widest">
              <MapPin className="h-3.5 w-3.5" />
              {location.region}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Kurs i {location.name}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl">{location.heroText}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#kurs">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 w-full sm:w-auto">
                  Se våre kurs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#kontakt">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 px-8 w-full sm:w-auto">
                  Kontakt oss
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
              Om KKS AS i {location.name}
            </h2>
            <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto">{location.about}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {location.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700 text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section id="kurs" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Våre kurs i {location.name}
          </h2>
          {courses.length === 0 ? (
            <div className="max-w-lg mx-auto text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 px-6">
              <p className="text-slate-600 mb-4">
                Ingen åpne kurssesjoner i {location.name} akkurat nå.
              </p>
              <a href="mailto:post@kksas.no">
                <Button variant="outline" size="sm">Be om kurs i {location.name}</Button>
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/lokasjon/${params.location}/${course.slug}`}
                  title={`${course.title} i ${location.name}`}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  {course.image && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={normalizeR2ImageUrl(course.image)}
                        alt={course.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit mb-2">
                      {getCourseCategoryLabel(course.category)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-amber-700 transition-colors flex-1">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {stripHtml(course.description).substring(0, 100)}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-slate-900 text-sm">
                        {course.price === 0 ? "Gratis" : `${course.price.toLocaleString("nb-NO")} kr`}
                      </span>
                      <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/kurs">
              <Button variant="outline" className="border-slate-300 text-slate-600 hover:border-amber-400 hover:text-amber-700">
                Se alle kurs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick links */}
      {courses.length > 0 && (
        <section className="py-10 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Kurshub {location.name} — raske lenker
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/lokasjon/${params.location}/${course.slug}`}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-amber-400 hover:text-amber-700 transition-all"
                >
                  <span>{course.title} i {location.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming sessions */}
      {sessions.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Kommende kursdatoer
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {sessions.map((session) => (
                <div key={session.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">{session.course.title}</h3>
                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {format(session.startsAt, "EEEE d. MMMM yyyy", { locale: nb })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {format(session.startsAt, "HH:mm", { locale: nb })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {session.location}
                    </div>
                  </div>
                  <Link href={`/kurs/${session.course.slug}/pamelding/${session.id}`}>
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs">
                      Meld deg på
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="kontakt" className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Kontakt oss i {location.name}
            </h2>
            <p className="text-slate-400 mb-8">
              Har du spørsmål om våre kurs i {location.name}? Vi hjelper deg gjerne!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href={`tel:${location.phone}`}>
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold w-full sm:w-auto">
                  <Phone className="mr-2 h-4 w-4" />
                  {location.phone}
                </Button>
              </a>
              <a href={`mailto:${location.email}`}>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 w-full sm:w-auto">
                  <Mail className="mr-2 h-4 w-4" />
                  {location.email}
                </Button>
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/kontakt">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:border-slate-500 w-full sm:w-auto">
                  Send melding
                </Button>
              </Link>
              <Link href="/bedrift">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:border-slate-500 w-full sm:w-auto">
                  Bedriftsavtale
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Ofte stilte spørsmål i {location.name}
            </h2>
            <div className="space-y-4">
              {locationFaqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-white hover:border-amber-300 transition-colors">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
