import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateFAQSchema,
  generateHowToSchema,
  generateSpeakableSchema,
  generateLocalBusinessSchema,
  generateYSKProgramSchema,
} from "@/lib/seo/schema";
import {
  Truck,
  Construction,
  HardHat,
  ShieldCheck,
  Laptop,
  ArrowRight,
  CheckCircle,
  Calendar,
  Heart,
  Award,
  Users,
  Target,
  TrendingUp,
  Star,
  Zap,
  HelpCircle,
  BadgeCheck,
  Clock,
  MapPin,
  Utensils,
  Cog,
  ArrowUp,
  HeartPulse,
} from "lucide-react";
import { FaqAccordion } from "@/components/public/FaqAccordion";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "YSK Etterutdanning Godstransport 35 timer | KKS AS",
  description:
    "YSK etterutdanning godstransport 35 timer — godkjent av Statens vegvesen. Kr 8 500,- inkl. lunsj. Kurs i Lierbyen og Hamar. KKS AS tilbyr også truck, kran og HMS i hele Norge.",
  keywords: [
    "YSK kurs",
    "YSK etterutdanning",
    "YSK godstransport",
    "YSK 35 timer",
    "yrkessjåførkurs",
    "etterutdanning lastebilsjåfør",
    "Statens vegvesen godkjent kurs",
    "truckkurs",
    "krankurs",
    "HMS kurs",
    "stillasmontørkurs",
    "KKS AS",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: BASE_URL,
    siteName: "KKS AS",
    title: "YSK Etterutdanning Godstransport 35 timer | KKS AS",
    description:
      "YSK etterutdanning godstransport 35 timer, godkjent av Statens vegvesen. Kr 8 500,- inkl. lunsj. Kurs i Lierbyen og Hamar.",
    images: [
      {
        url: `${BASE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "KKS AS — YSK Etterutdanning Godstransport",
      },
    ],
  },
};

const yskLocations = [
  {
    name: "Lierbyen",
    address: "Lierbyen",
    region: "Viken",
  },
  {
    name: "Hamar",
    address: "Næringsparkvegen 50",
    postalCode: "2323 Ingeberg",
    region: "Innlandet",
  },
];

const yskSteps = [
  {
    step: "01",
    title: "Sjekk utløpsdatoen din",
    description:
      "YSK-beviset fornyes hvert 5. år. Du kan melde deg på kurs opptil 6 måneder før utløp uten å miste gyldighet.",
  },
  {
    step: "02",
    title: "Velg kursdato",
    description:
      "Vi tilbyr YSK etterutdanning godstransport på ulike datoer. Finn en dato som passer deg og din arbeidsgiver.",
  },
  {
    step: "03",
    title: "Gjennomfør 35 timer",
    description:
      "Kurset kombinerer teori, praktiske øvelser og faglige diskusjoner — inkludert lunsj hver kursdag.",
  },
  {
    step: "04",
    title: "Kompetansen registreres",
    description:
      "Etter kurset registreres dokumentasjonen direkte i førerkortregisteret hos Statens vegvesen.",
  },
];

const courseGroups = [
  {
    category: "Truck",
    icon: Truck,
    href: "/kurs?category=truck",
    courses: [
      { name: "Truck T1, T2, T4", price: "6 000" },
      { name: "Truck praksis", price: "7 000" },
      { name: "C1, C2", price: "4 000" },
      { name: "Praksis C1 og C2", price: "7 500" },
    ],
  },
  {
    category: "Kran og løft",
    icon: Construction,
    href: "/kurs?category=kran",
    courses: [
      { name: "G4 traverskran", price: "11 000" },
      { name: "G8 lastebilkran", price: "11 000" },
      { name: "G11 løfteredskap", price: "9 500" },
      { name: "G20 fastmontert hydraulisk kran", price: "2 500" },
      { name: "Anhuker kurs", price: "2 300" },
    ],
  },
  {
    category: "Maskin",
    icon: Cog,
    href: "/kurs?category=maskin",
    courses: [
      { name: "Maskin 1 – fullt kurs med praksis", price: "25 000" },
      { name: "M1–M6 velg 3", price: "14 000" },
      { name: "Praksis M1–M6 velg 3", price: "25 000" },
      { name: "Maskin pr 1", price: "5 000" },
      { name: "Modul 1", price: "1 000" },
    ],
  },
  {
    category: "Stillas",
    icon: HardHat,
    href: "/kurs?category=stillas",
    courses: [
      { name: "Stillas 2–5 meter", price: "5 500" },
      { name: "Stillas 2–9 meter", price: "9 500" },
    ],
  },
  {
    category: "HMS og sikkerhet",
    icon: ShieldCheck,
    href: "/kurs?category=hms",
    courses: [
      { name: "HMS kurs 40 timer", price: "9 900" },
      { name: "Grunnkurs HMS bygg og anlegg", price: "2 590" },
      { name: "Regelverkskompetanse, petroleum", price: "4 500" },
      { name: "Verneombud", price: "1 390" },
      { name: "Diisocyanater", price: "1 390" },
      { name: "FSE Lav og høyspenning + førstehjelp", price: "1 570" },
      { name: "FSE Lavspenning + førstehjelp", price: "920" },
      { name: "FSE Instruert personell + førstehjelp", price: "820" },
      { name: "Grunnleggende brannvern", price: "820" },
    ],
  },
  {
    category: "Arbeid i høyden",
    icon: ArrowUp,
    href: "/kurs?category=hms",
    courses: [
      { name: "Personløfter", price: "2 500" },
      { name: "Fallsikring", price: "1 500" },
      { name: "Arbeid i høyden", price: "1 200" },
      { name: "1,25 m graving / grøftekurs", price: "1 500" },
      { name: "Høytrykkspylingssystemer", price: "1 800" },
      { name: "Farlig håndverktøy", price: "1 090" },
    ],
  },
  {
    category: "Førstehjelp",
    icon: HeartPulse,
    href: "/kurs?category=hms",
    courses: [
      { name: "Førstehjelp", price: "510" },
      { name: "Førstehjelp bygg og anlegg", price: "510" },
      { name: "Førstehjelp på barn", price: "510" },
    ],
  },
  {
    category: "Digital sikkerhet",
    icon: Laptop,
    href: "/kurs?category=digitale-kurs",
    courses: [
      { name: "Innføring datasikkerhet", price: "540" },
      { name: "Sosial manipulering", price: "540" },
      { name: "Behandling og sikring av data", price: "540" },
    ],
  },
];

const benefits = [
  {
    icon: Award,
    title: "Sertifiserte kurs",
    description:
      "Alle våre kurs er godkjent av Arbeidstilsynet og følger gjeldende lover og forskrifter",
  },
  {
    icon: Users,
    title: "Erfarne instruktører",
    description:
      "Våre instruktører har solid erfaring og ekspertise innen sine fagfelt",
  },
  {
    icon: Target,
    title: "Skreddersydde løsninger",
    description:
      "Vi tilpasser kursene til din bedrifts spesifikke behov og krav",
  },
  {
    icon: TrendingUp,
    title: "Kontinuerlig oppdatering",
    description:
      "Kursene våre holder seg oppdatert med siste standarder og beste praksis",
  },
  {
    icon: Star,
    title: "Høy kvalitet",
    description:
      "Følger ISO 9001-standarden for kvalitetssikring av alle våre tjenester",
  },
  {
    icon: Zap,
    title: "Fleksible løsninger",
    description:
      "Kurs både digitalt og fysisk, tilpasset dine behov og tidsplan",
  },
];

const stats = [
  { value: "500+", label: "Gjennomførte kurs" },
  { value: "2000+", label: "Fornøyde deltakere" },
  { value: "15+", label: "Års erfaring" },
  { value: "98%", label: "Kundetilfredshet" },
];

const homepageFaqs = [
  {
    question: "Hva er YSK etterutdanning for godstransport?",
    answer:
      "YSK (Yrkessjåførkompetanse) etterutdanning for godstransport er en obligatorisk 35 timers opplæring for yrkessjåfører som frakter gods og fører tunge kjøretøy. YSK-beviset må fornyes hvert 5. år og er godkjent av Statens vegvesen. Dokumentasjonen registreres direkte i førerkortregisteret.",
  },
  {
    question: "Hvem trenger YSK etterutdanning godstransport?",
    answer:
      "YSK etterutdanning er obligatorisk for alle yrkesaktive sjåfører med C1E- eller CE-førerkort (lastebil/vogntog) som bruker kjøretøyet yrkesmessig. Gjelder både ansatte sjåfører og selvstendig næringsdrivende transportører. Du kan melde deg på opptil 6 måneder før utløpsdato uten å miste gyldighet.",
  },
  {
    question: "Hva koster YSK kurs hos KKS AS?",
    answer:
      "Hos KKS AS tilbyr vi YSK etterutdanning for godstransport (35 timer) til kr 8 500,- per person inkludert lunsj alle kursdager, for bedrifter med avtale. Trenger du å leie lastebil til kursdagen koster det kr 1 000,- ekstra per person. Ta kontakt for bedriftsavtale og fakturering.",
  },
  {
    question: "Hvor holdes YSK kursene?",
    answer:
      "KKS AS holder YSK etterutdanning ved to faste lokasjoner: Lierbyen (Viken) og Hamar ved Næringsparkvegen 50, 2323 Ingeberg. Vi kan også arrangere bedriftsinterne YSK-kurs andre steder i Norge. Ta kontakt for tilpasset løsning.",
  },
  {
    question: "Hva er KKS AS?",
    answer:
      "KKS AS (Kurs og Kompetansesystemer AS) er en norsk kursleverandør grunnlagt i 2020. Vi tilbyr sertifisert yrkesopplæring innen truck, kran, stillas, arbeid på vei, HMS og BHT-opplæring i hele Norge. Vi er ISO 9001- og ISO 27001-sertifisert og godkjent av Arbeidstilsynet.",
  },
  {
    question: "Hvilke kurs tilbyr KKS AS?",
    answer:
      "KKS AS tilbyr truckfører kurs (T1–T8), kranfører kurs (G4, G8, G11), stillasmontørkurs (2–9 meter og over 9 meter), HMS grunnkurs og verneombudskurs, arbeid på vei og arbeidsvarslingskurs, BHT-obligatorisk kurs, maskinføreropplæring (M1–M6), personløfter, fallsikring og en rekke spesialkurs.",
  },
  {
    question: "Er kursene til KKS AS godkjent av Arbeidstilsynet?",
    answer:
      "Ja. Alle kurs hos KKS AS er godkjent og følger Arbeidstilsynets krav og retningslinjer. Vi er i tillegg ISO 9001:2015-sertifisert for kvalitetssikring og ISO 27001:2013-sertifisert for informasjonssikkerhet.",
  },
  {
    question: "Hvor holder KKS AS kurs i Norge?",
    answer:
      "KKS AS tilbyr kurs i hele Norge, inkludert Oslo, Bergen, Trondheim, Stavanger, Kristiansand og Tromsø. Vi kan også komme ut til din bedrift og gjennomføre kurs på stedet hvis dere har egnede lokaler.",
  },
  {
    question: "Hva koster et truckkurs hos KKS AS?",
    answer:
      "Prisene varierer etter kurstype og varighet. Se vår kursoversikt på kksas.no for oppdatert prisinformasjon. Bedrifter kan ta kontakt for å avtale skreddersydde bedriftspakker og volumbetingelser.",
  },
  {
    question: "Får jeg kursbevis etter gjennomført kurs?",
    answer:
      "Ja. Etter bestått eksamen mottar du et offisielt kompetansebevis fra KKS AS. Beviset dokumenterer din sertifisering og er godkjent i henhold til Arbeidstilsynets krav.",
  },
  {
    question: "Tilbyr KKS AS bedriftskurs og skreddersydde opplæringsprogram?",
    answer:
      "Ja. KKS AS tilbyr skreddersydde kursopplegg for bedrifter. Vi kan gjennomføre kurs hos din bedrift, tilpasse innholdet til din bransje og fakturere direkte. Kontakt oss på +47 91 54 08 24 eller post@kksas.no.",
  },
  {
    question: "Hva er BHT-opplæring og hvem trenger det?",
    answer:
      "BHT (bedriftshelsetjeneste) er en lovpålagt tjeneste for mange norske virksomheter. Obligatorisk BHT-kurs er påkrevd for ansatte i bedriftshelsetjenesten og gir nødvendig kompetanse innen arbeidsmiljø og helsevern. KKS AS tilbyr dette kurset i samarbeid med Dr Dropin.",
  },
  {
    question: "Kan KKS AS hjelpe med HMS-system for bedrifter?",
    answer:
      "Ja. Gjennom vårt BHT-medlemskap får din bedrift tilgang til HMS Nova — et komplett digitalt HMS-system — for 300 kr/mnd, i tillegg til 10 % rabatt på BHT-tjenester via Dr Dropin og en dedikert HMS-rådgiver.",
  },
  {
    question: "Hvordan melder jeg meg på et kurs hos KKS AS?",
    answer:
      "Gå til kksas.no/kurs, velg ønsket kurs og kursdato, fyll ut påmeldingsskjemaet med navn og e-post, og bekreft påmeldingen. Du mottar en bekreftelse på e-post. Kontakt oss på post@kksas.no eller +47 91 54 08 24 ved spørsmål.",
  },
];

export default function HomePage() {
  const faqSchema = generateFAQSchema(homepageFaqs);
  const howToSchema = generateHowToSchema(BASE_URL);
  const speakableSchema = generateSpeakableSchema([
    "h1",
    ".speakable-summary",
    ".faq-section h2",
  ]);
  const yskProgramSchema = generateYSKProgramSchema(BASE_URL);
  const lierbyenSchema = generateLocalBusinessSchema(
    BASE_URL,
    "lierbyen",
    "Lierbyen",
    "Viken"
  );
  const hamarSchema = generateLocalBusinessSchema(
    BASE_URL,
    "hamar",
    "Hamar",
    "Innlandet"
  );

  return (
    <div className="min-h-screen bg-white">
      <StructuredData
        data={[
          faqSchema,
          howToSchema,
          speakableSchema,
          yskProgramSchema,
          lierbyenSchema,
          hamarSchema,
        ]}
      />
      <Header />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[600px] md:min-h-[680px] flex items-center">
        {/* Bakgrunnsbilde */}
        <div className="absolute inset-0 lg:left-[45%]">
          <Image
            src="/images/hero-transport.png"
            alt="Lastebil på norsk vei"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Mobil: mørk overlay ovenfra og ned */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950 lg:hidden" />
          {/* Desktop: mørk fra venstre mot høyre */}
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/20" />
        </div>

        {/* Rutenett-tekstur */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:52px_52px]" />

        <div className="relative container mx-auto px-4 py-24 md:py-32 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 tracking-widest uppercase">
              <BadgeCheck className="h-4 w-4 flex-shrink-0" />
              Godkjent av Statens vegvesen
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
              YSK Etterutdanning
              <span className="block text-amber-400">Godstransport</span>
            </h1>

            <p className="speakable-summary text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed">
              35 timer obligatorisk etterutdanning for yrkessjåfører. Forny
              YSK-beviset ditt med erfarne instruktører — i hele Norge.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Link href="/kurs">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg px-8 h-14 rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Meld deg på kurs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 text-lg px-8 h-14 rounded-xl"
                >
                  Kontakt oss
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Clock, label: "35 timer", sub: "Obligatorisk" },
                { icon: BadgeCheck, label: "Statens vegvesen", sub: "Godkjent" },
                { icon: Utensils, label: "Lunsj inkludert", sub: "I prisen" },
                { icon: MapPin, label: "Lierbyen & Hamar", sub: "Faste lokasjoner" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 text-center backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white leading-snug">
                    {label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      </section>

      {/* ── YSK Steg ─────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Venstre: tekst + steg */}
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-4">
                  Slik fungerer YSK etterutdanning
                </h2>
                <p className="text-lg text-slate-600 mb-10">
                  Fire enkle steg til fornyelse av yrkessjåførkompetansen din
                </p>
                <div className="flex flex-col gap-4">
                  {yskSteps.map(({ step, title, description }) => (
                    <div
                      key={step}
                      className="flex gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center">
                        <span className="text-slate-950 font-black text-sm">
                          {step}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">
                          {title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Høyre: bilde */}
              <div className="relative hidden lg:block">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                  <Image
                    src="/images/ysk-training.png"
                    alt="YSK etterutdanning — instruktør og sjåfør ved lastebil"
                    fill
                    className="object-cover object-center"
                  />
                  {/* Amber-aksent overlay nederst */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-400" />
                </div>
                {/* Dekorativt element */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-500/10 rounded-3xl -z-10" />
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-slate-200 rounded-2xl -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── YSK Lokasjoner ───────────────────────────────── */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Lokasjoner for YSK-kurs
              </h2>
              <p className="text-slate-600 text-sm">
                Vi holder YSK etterutdanning ved to faste avdelinger
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {yskLocations.map((loc) => (
                <div
                  key={loc.name}
                  className="flex items-start gap-4 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-xl mb-0.5">
                      {loc.name}
                    </div>
                    <div className="text-slate-600 text-sm">{loc.address}</div>
                    {loc.postalCode && (
                      <div className="text-slate-500 text-sm">
                        {loc.postalCode}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-semibold">
                      {loc.region}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Priser (YSK) ─────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-slate-900 mb-4">
                Tydelige priser — ingen overraskelser
              </h2>
              <p className="text-lg text-slate-600">
                Fast pris for bedrifter med avtale. Alt inkludert.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Hoved-priskort */}
              <div className="relative bg-slate-950 text-white rounded-2xl p-8 overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-500/10 rounded-full" />
                <div className="absolute -bottom-12 -left-8 w-32 h-32 bg-amber-500/5 rounded-full" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                    Bedriftsavtale
                  </div>

                  <div className="mb-1 flex items-end gap-2">
                    <span className="text-5xl sm:text-6xl font-black text-white leading-none">
                      8 500
                    </span>
                    <span className="text-xl sm:text-2xl text-slate-400 font-semibold mb-1">
                      kr
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-7">
                    Per deltaker · inkludert lunsj alle kursdager
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "35 timer godkjent etterutdanning",
                      "Lunsj inkludert alle dager",
                      "Kursmateriell og dokumentasjon",
                      "Registrering i førerkortregisteret",
                      "Statens vegvesen godkjent",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-slate-300"
                      >
                        <CheckCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/kontakt">
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl h-12 text-base">
                      Bestill bedriftsavtale
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Tillegg + info */}
              <div className="flex flex-col gap-5">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">
                        Trenger du lastebil?
                      </h3>
                      <p className="text-slate-600 text-sm mb-3">
                        Har du ikke tilgang til lastebil kan du leie vår til
                        kursdagen.
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-slate-500 text-sm font-semibold">
                          Tillegg
                        </span>
                        <span className="text-3xl font-black text-amber-600 ml-2">
                          + 1 000
                        </span>
                        <span className="text-amber-700 font-bold">kr</span>
                        <span className="text-slate-500 text-sm ml-1">
                          / person
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">
                    Fordeler med bedriftsavtale
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Fast pris — enkel budsjettering",
                      "Vi planlegger fornyelsesdatoer for deg",
                      "Faktura direkte til bedriften",
                      "Dedikert kontaktperson",
                      "Fleksible kursdatoer i hele Norge",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-slate-700"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-16 bg-amber-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl font-black text-slate-950 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seksjonsbilde ────────────────────────────────── */}
      <section className="relative h-56 md:h-72 overflow-hidden">
        <Image
          src="/images/transport-highway.png"
          alt="Norsk vei sett fra truckkabinen"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 via-slate-950/40 to-slate-950/80" />
        <div className="absolute inset-0 flex items-end pb-10 justify-center">
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase">
            Profesjonell opplæring for yrkessjåfører i hele Norge
          </p>
        </div>
      </section>

      {/* ── Alle andre kurs ──────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Seksjonshode med Norsk Sertifisering-logo */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14 pb-8 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-2 bg-slate-950 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                  <MapPin className="h-3.5 w-3.5" />
                  Hele Norge — Vi kommer til deg
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-3">
                  Alle kurs vi tilbyr
                </h2>
                <p className="text-lg text-slate-600 max-w-xl">
                  Godkjent og sertifisert opplæring innen truck, kran, maskin,
                  stillas, HMS og mer — gjennomført hos deg eller ved en av våre lokasjoner.
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
                <div className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                  Godkjent av
                </div>
                  <Image
                  src="/logos/Norsk-Sertifisering_logo_RGB-1-e1711284968871.webp"
                  alt="Norsk Sertifisering"
                  width={240}
                  height={80}
                  className="h-20 w-auto object-contain"
                />
              </div>
            </div>

            {/* Kurskatalog grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courseGroups.map((group) => (
                <div
                  key={group.category}
                  className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 flex flex-col"
                >
                  {/* Kategori-header */}
                  <div className="flex items-center gap-3 px-5 py-4 bg-slate-900">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <group.icon className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="font-bold text-white text-sm uppercase tracking-wider">
                      {group.category}
                    </span>
                  </div>

                  {/* Kursliste */}
                  <div className="flex-1 divide-y divide-slate-100">
                    {group.courses.map((course) => (
                      <div
                        key={course.name}
                        className="flex items-center justify-between px-5 py-3 gap-4"
                      >
                        <span className="text-sm text-slate-700 leading-snug">
                          {course.name}
                        </span>
                        <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                          {course.price} kr
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="px-5 py-4 border-t border-slate-100">
                    <Link href={group.href}>
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
              * Alle priser er veiledende per person inkl. mva. Kontakt oss for
              bedriftsavtale og volumpris.
            </p>
          </div>
        </div>
      </section>

      {/* ── Fordeler ─────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Hvorfor velge KKS AS?
            </h2>
            <p className="text-lg text-slate-600">
              Vi setter din sikkerhet og kompetanse i fokus
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 p-6 rounded-xl border border-slate-100 bg-white"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BHT / Dr Dropin ──────────────────────────────── */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start gap-10">
              {/* Venstre: intro */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 uppercase tracking-widest">
                  <Heart className="h-3.5 w-3.5" />
                  BHT-avtale via Dr Dropin
                </div>
                <h2 className="text-4xl font-black mb-4 leading-tight">
                  Bli KKS-medlem og spar på BHT og kurs
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Vi har avtale med Dr Dropin om bedriftshelsetjeneste (BHT)
                  for våre medlemmer. Velg HMS Nova som HMS-system og få bedre
                  betingelser — alt på ett sted.
                </p>
                <Link href="/bht-medlem">
                  <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-6 h-11">
                    Les mer om BHT-medlemskap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Høyre: fordeler */}
              <div className="flex-1 grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Fra 440 kr/mnd",
                    desc: "BHT via Dr Dropin for din bedrift",
                  },
                  {
                    title: "10 % rabatt",
                    desc: "På BHT-tjenester når du velger HMS Nova",
                  },
                  {
                    title: "HMS Nova — 300 kr/mnd",
                    desc: "Komplett digitalt HMS-system for din bedrift",
                  },
                  {
                    title: "Kursrabatter",
                    desc: "Bedre rabatter på kurs innen arbeidsutstyr for medlemmer",
                  },
                  {
                    title: "Dedikert rådgiver",
                    desc: "Din faste HMS-kontaktperson",
                  },
                  {
                    title: "Enkel administrasjon",
                    desc: "Samle BHT, HMS og kurs på ett sted",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="font-bold text-amber-400 text-sm mb-1">
                      {item.title}
                    </div>
                    <div className="text-slate-400 text-xs leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="faq-section py-20 bg-white">
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
                Alt du trenger å vite om kurs og opplæring hos KKS AS
              </p>
            </div>
            <FaqAccordion items={homepageFaqs} />
          </div>
        </div>
      </section>

      {/* ── Avsluttende CTA ──────────────────────────────── */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8">
              <Calendar className="h-7 w-7 text-amber-400" />
            </div>
            <h2 className="text-4xl font-black mb-4">
              Klar til å fornye YSK-beviset?
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Ta kontakt for bedriftsavtale eller finn ditt neste kurs og ta
              steget mot økt kompetanse og sikkerhet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kurs">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg px-8 h-14 rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Se alle kurs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 text-lg px-8 h-14 rounded-xl"
                >
                  Kontakt oss
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
