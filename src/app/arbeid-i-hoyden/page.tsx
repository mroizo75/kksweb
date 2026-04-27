import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateAggregateRatingSchema,
} from "@/lib/seo/schema";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import {
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  ArrowUp,
  HardHat,
  BadgeCheck,
  Users,
  Clock,
  ChevronRight,
  HelpCircle,
  Phone,
  Mail,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "Arbeid i høyden kurs — Fallsikring, Personløfter og Stillas | KKS AS",
  description:
    "Godkjente kurs for arbeid i høyden: fallsikring, personløfter, stillasarbeid og lovkrav. Sertifiserte instruktører i hele Norge. Fra kr 1 200,-. Meld deg på i dag.",
  keywords: [
    "arbeid i høyden kurs",
    "fallsikringskurs",
    "personløfterkurs",
    "stillasmontørkurs",
    "arbeid i høyden regelverk",
    "kurs arbeid i høyden",
    "sikkerhetskurs høyden",
    "arbeidstilsynet arbeid i høyden",
    "fallsikring opplæring",
    "personlig verneutstyr kurs",
  ],
  alternates: {
    canonical: `${BASE_URL}/arbeid-i-hoyden`,
  },
  openGraph: {
    title: "Arbeid i høyden kurs — Fallsikring, Personløfter og Stillas | KKS AS",
    description:
      "Godkjente kurs for arbeid i høyden. Fallsikring, personløfter, stillas og lovkrav. KKS AS — sertifiserte instruktører i hele Norge.",
    url: `${BASE_URL}/arbeid-i-hoyden`,
    siteName: "KKS AS",
    locale: "nb_NO",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "KKS AS — Arbeid i høyden kurs",
      },
    ],
  },
};

const courses = [
  {
    slug: "fallsikring",
    title: "Fallsikringskurs",
    description:
      "Opplæring i korrekt bruk av fallsikringsutstyr, inkludert sele, tau og forankringspunkter. Lovpålagt for alle som arbeider i høyden uten fast rekkverk.",
    duration: "1 dag",
    price: "1 500",
    tag: "Mest populær",
  },
  {
    slug: "personlofter",
    title: "Personløfterkurs",
    description:
      "Sertifisering for bruk av arbeidskurv, sakselift og teleskoplift (MEWP). Nødvendig kompetanse for operatører av selvgående løfteplattformer.",
    duration: "1 dag",
    price: "2 500",
    tag: null,
  },
  {
    slug: "arbeid-i-hoyden",
    title: "Arbeid i høyden — grunnkurs",
    description:
      "Grunnleggende opplæring i sikker arbeidsmetodikk ved arbeid på tak, fasade og andre utsatte steder. Dekker lovkrav og risikovurdering.",
    duration: "1 dag",
    price: "1 200",
    tag: null,
  },
  {
    slug: "stillas-2-5-meter",
    title: "Stillaskurs 2–5 meter",
    description:
      "Bruk og montering av fasadestillas opp til 5 meters arbeidsplatthøyde. Godkjent opplæring i henhold til Arbeidstilsynets krav.",
    duration: "1 dag",
    price: "5 500",
    tag: null,
  },
  {
    slug: "stillas-2-9-meter",
    title: "Stillaskurs 2–9 meter",
    description:
      "Avansert kurs for montering og bruk av stillas opp til 9 meters høyde. Inkluderer risikovurdering og kontroll av stillas.",
    duration: "2 dager",
    price: "9 500",
    tag: null,
  },
  {
    slug: "graving-grofte",
    title: "Grøftekurs — 1,25 m graving",
    description:
      "Kurs i sikker graving og sikring av grøfter over 1,25 meters dybde. Lovpålagt for alle som jobber i eller nær dype grøfter.",
    duration: "½ dag",
    price: "1 500",
    tag: null,
  },
];

const legalRequirements = [
  "Arbeid over 2 meters høyde krever dokumentert opplæring i fallsikring (AML § 3-2)",
  "Bruk av personlig fallutstyr krever sertifisert opplæring (Forskrift om utførelse av arbeid § 17-3)",
  "Operatører av løfteplattformer (MEWP) skal ha godkjent sertifikat",
  "Stillasmontasje over 2 meter krever dokumentert kompetanse",
  "Arbeidsgiver er ansvarlig for at alle ansatte har nødvendig opplæring",
  "Manglende opplæring kan medføre bøter fra Arbeidstilsynet",
];

const faqs = [
  {
    question: "Hvem trenger kurs i arbeid i høyden?",
    answer:
      "Alle arbeidstakere som utfører arbeid i høyden over 2 meter er lovpålagt å ha dokumentert opplæring. Dette gjelder rørleggere, elektrikere, taktekker, bygningsarbeidere, malere og alle andre som regelmessig arbeider på tak, stillas, stige eller med løfteplattform. Kravet er hjemlet i Arbeidsmiljøloven § 3-2 og Forskrift om utførelse av arbeid.",
  },
  {
    question: "Hva er forskjellen på fallsikring og arbeid i høyden kurs?",
    answer:
      "Grunnkurset i arbeid i høyden gir generell kunnskap om sikker arbeidsmetodikk, risikovurdering og lovkrav. Fallsikringskurset fokuserer spesifikt på bruk av personlig fallutstyr som sele, tau, absorbent og forankringspunkter. Mange velger begge kursene for full kompetanse.",
  },
  {
    question: "Hva koster kurs i arbeid i høyden?",
    answer:
      "Kurs i arbeid i høyden koster fra kr 1 200,- for grunnkurset. Fallsikringskurs er kr 1 500,- og personløfterkurs kr 2 500,-. Stillaskurs starter på kr 5 500,- for 2–5 meter. Bedrifter med avtale får volumrabatt — kontakt oss for tilbud.",
  },
  {
    question: "Kan KKS AS holde kurs hos vår bedrift?",
    answer:
      "Ja. Vi gjennomfører bedriftsinterne kurs i arbeid i høyden over hele Norge. Vi tar med instruktør og nødvendig utstyr. Dere trenger kun et egnet areal. Bedriftsinterne kurs er kostnadseffektivt for grupper på 4 eller flere.",
  },
  {
    question: "Hva er gyldighetsperioden for kursbeviset?",
    answer:
      "Kursbeviset i arbeid i høyden har ingen fast utløpsdato, men Arbeidstilsynet anbefaler periodisk oppdatering hvert 3–5 år, eller ved bruk av nytt utstyr. Operatørsertifikater for personløftere (MEWP) fra EU/EAC følger separate regler.",
  },
  {
    question: "Er kursene godkjent av Arbeidstilsynet?",
    answer:
      "Ja. Alle kurs fra KKS AS er godkjent av Arbeidstilsynet og følger kravene i Forskrift om utførelse av arbeid. Vi er ISO 9001:2015-sertifisert og alle deltakere mottar offisielle kompetansebevis.",
  },
];

export default function ArbeidIHoydenPage() {
  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: "Arbeid i høyden", url: "/arbeid-i-hoyden" },
    ],
    BASE_URL
  );
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Arbeid i høyden kurs — fallsikring, personløfter og stillas",
    "description":
      "Godkjent opplæring i arbeid i høyden. Fallsikring, personløfter, stillasmontørkurs og grøftekurs. Sertifiserte instruktører i hele Norge.",
    "provider": {
      "@type": "EducationalOrganization",
      "@id": `${BASE_URL}/#organization`,
      "name": "KKS AS",
      "url": BASE_URL,
    },
    "serviceType": "Kurs og sertifisering arbeid i høyden",
    "areaServed": { "@type": "Country", "name": "Norway" },
    "aggregateRating": generateAggregateRatingSchema(),
    "url": `${BASE_URL}/arbeid-i-hoyden`,
    "offers": courses.map((c) => ({
      "@type": "Offer",
      "name": c.title,
      "price": c.price.replace(/\s/g, ""),
      "priceCurrency": "NOK",
      "availability": "https://schema.org/InStock",
      "url": `${BASE_URL}/kurs/${c.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={[faqSchema, breadcrumbSchema, serviceSchema]} />
      <Header />

      {/* ── Hero ─────────────────────────────────── */}
      <section className="bg-slate-950 text-white pt-24 pb-20">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Hjem
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">Arbeid i høyden</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 tracking-widest uppercase">
              <BadgeCheck className="h-4 w-4 flex-shrink-0" />
              Godkjent av Arbeidstilsynet
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              Kurs for arbeid i høyden
              <span className="block text-amber-400">Fallsikring, personløfter og stillas</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
              Lovpålagt sertifisering for alle som jobber i høyden. Godkjente kurs med
              erfarne instruktører — vi gjennomfører kurs hos dere i hele Norge.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/kurs?category=hms">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg px-8 h-14 rounded-xl"
                >
                  Se ledige kursdatoer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/bedrift">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 text-lg px-8 h-14 rounded-xl"
                >
                  Bestill bedriftskurs
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Clock, label: "Fra 1 dag", sub: "Korteste kurs" },
                { icon: BadgeCheck, label: "Arbeidstilsynet", sub: "Godkjent" },
                { icon: Users, label: "Hele Norge", sub: "Vi reiser til deg" },
                { icon: ShieldCheck, label: "ISO 9001", sub: "Kvalitetssikret" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 text-center"
                >
                  <Icon className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white leading-snug">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Lovkrav ──────────────────────────────── */}
      <section className="py-16 bg-amber-50 border-y border-amber-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  Lovkrav du må kjenne til
                </h2>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Norsk lov krever dokumentert opplæring for arbeid i høyden. Her er de
                  viktigste reglene:
                </p>
                <ul className="space-y-3">
                  {legalRequirements.map((req) => (
                    <li key={req} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kurs ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-slate-900 mb-4">
                Alle kurs for arbeid i høyden
              </h2>
              <p className="text-lg text-slate-600">
                Velg kurset som passer dine arbeidsoppgaver og krav
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.slug}
                  className="relative border border-slate-100 rounded-2xl bg-slate-50 flex flex-col overflow-hidden"
                >
                  {course.tag && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {course.tag}
                    </div>
                  )}

                  <div className="flex items-center gap-3 px-5 py-4 bg-slate-900">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <ArrowUp className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="font-bold text-white text-sm">{course.title}</span>
                  </div>

                  <div className="flex-1 p-5">
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {course.price} kr
                      </span>
                    </div>
                    <Link href={`/kurs/${course.slug}`}>
                      <Button
                        variant="outline"
                        className="w-full border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-sm font-semibold rounded-xl h-10"
                      >
                        Meld deg på
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-500 text-sm mt-8">
              * Alle priser er per person inkl. mva. Kontakt oss for bedriftsavtale og volumpris.
            </p>
          </div>
        </div>
      </section>

      {/* ── Hvem trenger dette ───────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-4 text-center">
              Hvem trenger kurs i arbeid i høyden?
            </h2>
            <p className="text-center text-slate-600 mb-12">
              Arbeidstilsynet krever dokumentert opplæring for disse yrkesgruppene
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Taktekker og takarbeidere",
                "Bygningsarbeidere og tømmermenn",
                "Elektrikere og rørleggere",
                "Malere og fasadearbeidere",
                "Serviceteknikere (ventilasjon, kjøl)",
                "Vindmølleteknikere",
                "Bryggeri- og industriarbeidere",
                "Montører og installatører",
                "Rengjøringspersonell i høyden",
              ].map((role) => (
                <div
                  key={role}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100"
                >
                  <HardHat className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-4">
                <HelpCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">
                Ofte stilte spørsmål
              </h2>
              <p className="text-lg text-slate-600">
                Alt du trenger å vite om kurs for arbeid i høyden
              </p>
            </div>
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-4">Klar for sikker jobbing i høyden?</h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Meld deg på et av våre godkjente kurs eller ta kontakt for skreddersydde
              bedriftskurs i arbeid i høyden
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/kurs?category=hms">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg px-8 h-14 rounded-xl"
                >
                  Se alle kursdatoer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/bedrift">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 text-lg px-8 h-14 rounded-xl"
                >
                  Bestill bedriftskurs
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-slate-400 text-sm">
              <a
                href="tel:+4791540824"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                +47 91 54 08 24
              </a>
              <a
                href="mailto:post@kksas.no"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                post@kksas.no
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
