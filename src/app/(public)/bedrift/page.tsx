import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { BedriftKontaktForm } from "./form";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateFAQSchema } from "@/lib/seo/schema";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import {
  Users,
  CheckCircle,
  ArrowRight,
  Building2,
  Calendar,
  Award,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Zap,
  FileText,
  Headphones,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "HMS kurs bedrift og skreddersydde kursløsninger | KKS AS",
  description:
    "HMS kurs for bedrifter — truck, kran, stillas og sikkerhetssertifisering. Vi kommer til dere, fakturerer direkte og gir volumrabatt. ISO 9001-godkjent. Ring +47 91 54 08 24.",
  keywords: [
    "HMS kurs bedrift",
    "truckkurs bedrift",
    "kurs for bedrifter",
    "bedriftskurs HMS",
    "HMS opplæring ansatte",
    "skreddersydde kurs",
    "kurs på arbeidsplassen",
    "HMS krav bygg og anlegg",
    "sikkerhetskurs bedrift",
    "yrkesopplæring bedrift",
  ],
  alternates: {
    canonical: `${BASE_URL}/bedrift`,
  },
  openGraph: {
    title: "HMS kurs og opplæring for bedrifter | KKS AS",
    description:
      "Skreddersydde HMS-kurs og sertifiseringsprogram for norske bedrifter. Vi tilpasser, vi kommer til dere og fakturerer direkte.",
    url: `${BASE_URL}/bedrift`,
    siteName: "KKS AS",
    locale: "nb_NO",
    type: "website",
  },
};

const benefits = [
  {
    icon: Users,
    title: "Skreddersydde kurs",
    description: "Tilpass kursinnholdet til deres spesifikke behov og bransje",
  },
  {
    icon: Building2,
    title: "På deres lokasjon",
    description: "Vi kommer til dere — spar tid og reisekostnader for deres ansatte",
  },
  {
    icon: Calendar,
    title: "Fleksible kurstider",
    description: "Velg tidspunkt som passer best for deres virksomhet",
  },
  {
    icon: DollarSign,
    title: "Volumrabatt",
    description: "Få bedre priser ved bestilling av flere kursplasser",
  },
  {
    icon: Award,
    title: "Digitale sertifikater",
    description: "Automatisk utsteding av kursbevis og kompetansekort",
  },
  {
    icon: ShieldCheck,
    title: "HMS-oppfølging",
    description: "Følg opp ansattes kompetanse og sertifikater enkelt",
  },
  {
    icon: Zap,
    title: "Rask oppstart",
    description: "Vi setter opp kurs raskt — ofte innen få dager",
  },
  {
    icon: FileText,
    title: "Dokumentasjon",
    description: "Full oversikt over alle kurs og deltakere i ett system",
  },
  {
    icon: Headphones,
    title: "Dedikert support",
    description: "Personlig kontaktperson for deres bedrift",
  },
];

const courses = [
  { title: "Truckkurs", description: "Opplæring i sikker bruk av truck", duration: "2–3 dager" },
  { title: "Krankurs", description: "Sertifisering for kranføring", duration: "3–5 dager" },
  { title: "Stillaskurs", description: "Sikker montering og bruk av stillas", duration: "1–2 dager" },
  { title: "HMS-kurs", description: "Helse, miljø og sikkerhet på arbeidsplassen", duration: "1 dag" },
  { title: "Verne- og sikkerhetsutstyr", description: "Korrekt bruk av personlig verneutstyr", duration: "½ dag" },
  { title: "Førstehjelp", description: "Grunnleggende førstehjelp på arbeidsplassen", duration: "1 dag" },
];

const steps = [
  { number: "1", title: "Ta kontakt", description: "Fyll ut skjemaet eller ring oss direkte" },
  { number: "2", title: "Kartlegging", description: "Vi kartlegger deres behov og lager et tilpasset tilbud" },
  { number: "3", title: "Planlegging", description: "Vi blir enige om tid, sted og innhold" },
  { number: "4", title: "Gjennomføring", description: "Vi holder kurset hos dere eller på vårt kurssenter" },
  { number: "5", title: "Oppfølging", description: "Digitale kursbevis og oppfølging i vårt system" },
];

const bedriftFaqs = [
  {
    question: "Hvilke HMS-kurs tilbyr KKS AS for bedrifter?",
    answer:
      "KKS AS tilbyr et bredt spekter av HMS-kurs for bedrifter: grunnkurs HMS 40 timer, grunnkurs HMS bygg og anlegg, verneombudskurs, truckkurs (T1–T4), krankurs (G4, G8, G11), stillasmontørkurs, arbeid i høyden, fallsikring og personløfter. Vi skreddersyr opplæringen til din bransje og gjennomfører kurset hos dere.",
  },
  {
    question: "Kan dere komme ut til vår bedrift og holde kurs?",
    answer:
      "Ja. KKS AS reiser til bedrifter over hele Norge. Vi tar med instruktører, materiell og utstyr. Dere trenger kun et egnet kurslokale. Bedriftsinterne kurs er kostnadseffektivt for grupper på 5 eller flere deltakere.",
  },
  {
    question: "Hva koster HMS-kurs for bedrifter?",
    answer:
      "Prisen avhenger av kurstype, antall deltakere og lokasjon. Grunnkurs HMS bygg og anlegg starter fra kr 2 590 per person. HMS kurs 40 timer koster kr 9 900 per person. Bedrifter med avtale får volumrabatt — kontakt oss på +47 91 54 08 24 for tilbud.",
  },
  {
    question: "Får vi faktura direkte til bedriften?",
    answer:
      "Ja. Vi fakturerer direkte til bedriften med 14 dagers betalingsfrist. Dere trenger ikke å forskuddsbetale per deltaker.",
  },
  {
    question: "Er kursene godkjent av Arbeidstilsynet?",
    answer:
      "Ja. Alle kurs fra KKS AS er godkjent av Arbeidstilsynet og oppfyller kravene i Forskrift om utførelse av arbeid. Vi er i tillegg ISO 9001:2015-sertifisert. Kursdeltakere mottar offisielle kompetansebevis.",
  },
  {
    question: "Hvor mange deltakere trenger vi for å bestille bedriftskurs?",
    answer:
      "Vi gjennomfører bedriftsinterne kurs fra 4–5 deltakere. For mindre grupper anbefaler vi åpne kurs. Ta kontakt så finner vi den beste løsningen for dere.",
  },
  {
    question: "Tilbyr dere HMS-system i tillegg til kurs?",
    answer:
      "Ja. KKS AS tilbyr BHT-medlemskap som inkluderer HMS Nova — et komplett digitalt HMS-system for 300 kr/mnd — samt BHT-tjenester via Dr Dropin. Les mer på kksas.no/bht-medlem.",
  },
];

export default function BedriftPage() {
  const faqSchema = generateFAQSchema(bedriftFaqs);
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "HMS kurs og bedriftskursløsninger — KKS AS",
    "description":
      "Skreddersydde HMS-kurs og sertifiseringsprogram for norske bedrifter. Truck, kran, stillas, arbeid i høyden og HMS-opplæring. Vi gjennomfører kurs hos din bedrift i hele Norge.",
    "provider": {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "KKS AS",
      "url": BASE_URL,
    },
    "serviceType": "Bedriftskurs og HMS-opplæring",
    "areaServed": { "@type": "Country", "name": "Norway" },
    "url": `${BASE_URL}/bedrift`,
  };

  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={[faqSchema, serviceSchema]} />
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">Bedrift</span>
          </nav>
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Bedriftsavtaler
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Kursløsninger for bedrifter
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl">
              Sikre at deres ansatte har nødvendig kompetanse og sertifiseringer. Vi tilbyr skreddersydde kursløsninger for små og store bedrifter — vi kommer til dere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#kontakt">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 w-full sm:w-auto">
                  Be om tilbud
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Link href="/kurs">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 px-8 w-full sm:w-auto">
                  Se alle kurs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Hvorfor velge oss?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Vi gjør det enkelt for bedrifter å sikre at ansatte har riktig kompetanse
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{benefit.title}</h3>
                  <p className="text-sm text-slate-500">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular courses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Populære kurs for bedrifter</h2>
            <p className="text-slate-500">
              Vi tilbyr et bredt spekter av kurs innen HMS, sikkerhet og kompetanse
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {courses.map((course) => (
              <div key={course.title} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{course.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{course.duration}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/kurs">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:border-amber-400 hover:text-amber-700">
                Se alle kurs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Slik fungerer det</h2>
            <p className="text-slate-500">Enkelt og oversiktlig prosess fra forespørsel til gjennomføring</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-6 relative">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-bold flex-shrink-0 z-10">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 bg-amber-200 flex-1 mt-1 mb-1 min-h-[2rem]" />
                  )}
                </div>
                <div className={`pb-8 pt-2 ${index < steps.length - 1 ? "" : ""}`}>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-slate-500 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="kontakt" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Be om tilbud</h2>
              <p className="text-slate-500">
                Fyll ut skjemaet så tar vi kontakt med deg for en uforpliktende samtale
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <BedriftKontaktForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-4">
                <HelpCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Vanlige spørsmål om HMS-kurs for bedrifter
              </h2>
              <p className="text-slate-500">
                Alt du trenger å vite om bedriftskurs, HMS-opplæring og bestillinger
              </p>
            </div>
            <FaqAccordion items={bedriftFaqs} />
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-slate-950 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Klar til å komme i gang?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Kontakt oss i dag for et uforpliktende tilbud på kurs for deres bedrift
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#kontakt">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 w-full sm:w-auto">
                Be om tilbud
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/bht-medlem">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 px-8 w-full sm:w-auto">
                Bli BHT-medlem
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
