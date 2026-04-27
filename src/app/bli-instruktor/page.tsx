import { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Banknote,
  Clock,
  Star,
  BookOpen,
  Users,
  ShieldCheck,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "Bli instruktør hos KKS AS — Ledige stillinger for kursholdere",
  description:
    "KKS AS søker erfarne instruktører innen truck (T1, T2, T4), maskin (M1–M6), kran og HMS. Fleksibel hverdag, gode inntjeningsmuligheter og faglig støtte. Ta kontakt — vi forteller mer.",
  keywords: [
    "bli instruktør",
    "kursinstruktør jobb",
    "instruktør truck kurs",
    "instruktør HMS kurs",
    "jobb som kursholder",
    "instruktør kran maskin",
    "ledige stillinger KKS AS",
    "instruktørkurs opplæring",
  ],
  alternates: {
    canonical: `${BASE_URL}/bli-instruktor`,
  },
  openGraph: {
    title: "Bli instruktør hos KKS AS — Ledige stillinger",
    description:
      "Vi søker dyktige instruktører innen truck, maskin, kran og HMS. Fleksibel hverdag og gode inntjeningsmuligheter. Start med vårt eget instruktørkurs (50+ timer).",
    url: `${BASE_URL}/bli-instruktor`,
    type: "website",
    locale: "nb_NO",
    siteName: "KKS AS",
    images: [
      {
        url: `${BASE_URL}/og-instruktor.jpg`,
        width: 1200,
        height: 630,
        alt: "Bli instruktør hos KKS AS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bli instruktør hos KKS AS",
    description:
      "Søker du jobb som kursinstruktør? Vi tilbyr fleksibelt oppdrag, faglig støtte og gode inntjeningsmuligheter. Ring oss for å høre mer.",
  },
};

// ── JSON-LD schemas ──────────────────────────────────────────────────────────

const jobPostingSchema = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Kursinstruktør — truck, maskin, kran og HMS",
  description:
    "KKS AS søker dyktige instruktører til gjennomføring av kurs innen truck (T1, T2, T4), maskinføreropplæring (M1–M6), kranfører og HMS. Kursene gjennomføres under KKS AS sine godkjenninger. Ta kontakt for informasjon om betingelser.",
  datePosted: "2025-01-01",
  validThrough: "2026-12-31",
  employmentType: "CONTRACTOR",
  hiringOrganization: {
    "@type": "Organization",
    name: "KKS AS",
    sameAs: BASE_URL,
    logo: `${BASE_URL}/logo-black-kks.png`,
  },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressCountry: "NO",
      addressLocality: "Furnes",
      addressRegion: "Innlandet",
    },
  },
  jobLocationType: "TELECOMMUTE",
  applicantLocationRequirements: {
    "@type": "Country",
    name: "Norge",
  },
  responsibilities:
    "Gjennomføre kurs og opplæring (truckfører, maskinføreropplæring, kranfører m.m.), planlegge og strukturere kursgjennomføring, sørge for korrekt dokumentasjon av opplæring, følge HMS-krav og gjeldende regelverk, dialog med kunder i forbindelse med kurs.",
  qualifications:
    "Erfaring innen fagområdet (truck, maskin, kran, HMS eller lignende), kompetansebevis, fagbrev eller dokumentert praksis, evne til å lære bort og formidle kunnskap, interesse for sikkerhet og HMS, strukturert og selvstendig arbeidsform.",
  skills: "Truck T1 T2 T4, maskinføreropplæring, kran, HMS, sertifisert opplæring, Arbeidstilsynet",
  industry: "Opplæring og sertifisering",
  baseSalary: {
    "@type": "MonetaryAmountDistribution",
    name: "Gode inntjeningsmuligheter — ta kontakt for detaljer",
    currency: "NOK",
    duration: "P1Y",
    median: 0,
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hva innebærer det å jobbe som instruktør hos KKS AS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Du gjennomfører kurs på oppdrag for KKS AS under våre godkjenninger og faglige rammer. Ring oss på 91 54 08 24 for å høre mer om betingelser og praktiske detaljer.",
      },
    },
    {
      "@type": "Question",
      name: "Hva er godtgjørelsen for instruktører hos KKS AS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vi tilbyr veldig gode inntjeningsmuligheter basert på gjennomførte kurs. Ta kontakt på telefon eller e-post for å høre mer om hva vi kan tilby deg.",
      },
    },
    {
      "@type": "Question",
      name: "Hvilke kurs kan jeg holde som instruktør hos KKS AS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Du kan holde truckførerkurs (T1, T2, T4), maskinføreropplæring (M1–M6), kranfører (G4, G8, G11), HMS-kurs, arbeid på vei og andre sertifiserte kurs som KKS AS tilbyr.",
      },
    },
    {
      "@type": "Question",
      name: "Trenger jeg å ta instruktørkurs for å jobbe som instruktør hos KKS AS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja. Alle som skal jobbe som instruktør hos KKS AS gjennomfører et internt instruktørkurs på 50+ timer. Her lærer du pedagogikk, kursgjennomføring, regelverk, HMS og dokumentasjon.",
      },
    },
    {
      "@type": "Question",
      name: "Er dette en fast stilling eller oppdrag?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ring oss på 91 54 08 24 eller send e-post til post@kksas.no — så forteller vi deg alt om hvordan samarbeidet er lagt opp.",
      },
    },
    {
      "@type": "Question",
      name: "Hvordan søker jeg på instruktørstillingen hos KKS AS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Send en e-post til post@kksas.no med en kort beskrivelse av din erfaring og hvilke kurs du ønsker å holde. Du kan også ringe oss på 91 54 08 24. Vi tar kontakt innen 2 virkedager.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Hjem", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Bli instruktør", item: `${BASE_URL}/bli-instruktor` },
  ],
};

// ── Static content ───────────────────────────────────────────────────────────

const tilbyr = [
  {
    icon: BookOpen,
    title: "Ferdige kursopplegg",
    description: "Strukturerte kursopplegg og godkjent faglig innhold klart til bruk — du fokuserer på undervisningen.",
  },
  {
    icon: GraduationCap,
    title: "Instruktørkurs (50+ timer)",
    description: "Vi lærer deg alt du trenger: pedagogikk, gjennomføring, regelverk og dokumentasjon.",
  },
  {
    icon: Banknote,
    title: "Veldig gode inntjeningsmuligheter",
    description: "Konkurransedyktig godtgjørelse basert på gjennomførte kurs. Ring oss for detaljer.",
  },
  {
    icon: Clock,
    title: "Fleksibel arbeidshverdag",
    description: "Du velger når og hvor du er tilgjengelig. Perfekt som heltid, deltid eller ved siden av annet arbeid.",
  },
  {
    icon: ShieldCheck,
    title: "Faglig støtte",
    description: "Du jobber under våre godkjenninger og har alltid faglig støtte og oppfølging fra KKS AS.",
  },
  {
    icon: Star,
    title: "Digitale systemer",
    description: "Tilgang til våre digitale systemer for kursadministrasjon, deltakerlister og kompetansebevis.",
  },
];

const oppgaver = [
  "Gjennomføre kurs og opplæring (truckfører T1/T2/T4, maskinføreropplæring, kranfører m.m.)",
  "Planlegge og strukturere kursgjennomføring",
  "Sørge for korrekt dokumentasjon av opplæring",
  "Følge HMS-krav og gjeldende regelverk",
  "Dialog med kunder i forbindelse med kurs",
];

const krav = [
  "Erfaring innen fagområdet (truck, maskin, kran, HMS eller lignende)",
  "Kompetansebevis, fagbrev eller dokumentert praksis",
  "Evne til å lære bort og formidle kunnskap klart og tydelig",
  "Interesse for sikkerhet og HMS",
  "Strukturert og selvstendig arbeidsform",
];

const opplaring = [
  { title: "Pedagogikk", description: "Hvordan lære bort effektivt og tilpasse undervisningen til ulike deltakere." },
  { title: "Kursgjennomføring", description: "Praktisk og teoretisk gjennomføring av godkjente kurs." },
  { title: "Regelverk", description: "Krav til sertifisert opplæring etter Arbeidstilsynets forskrifter." },
  { title: "HMS og sikkerhet", description: "Sikker opplæring og ansvaret som instruktør." },
  { title: "Dokumentasjon", description: "Korrekt bruk av systemene for kompetansebevis og deltakerlister." },
];

const faqs = [
  {
    q: "Hva innebærer det å jobbe som instruktør hos KKS AS?",
    a: "Du gjennomfører kurs på oppdrag for KKS AS under våre godkjenninger og faglige rammer. Vil du vite mer om hvordan samarbeidet er lagt opp? Ring oss på 91 54 08 24 — vi forteller deg alt.",
  },
  {
    q: "Hva er godtgjørelsen for instruktører?",
    a: "Vi tilbyr veldig gode inntjeningsmuligheter basert på gjennomførte kurs. Ta kontakt på telefon eller e-post, så går vi gjennom dette med deg direkte.",
  },
  {
    q: "Hvilke kurs kan jeg holde?",
    a: "Truckførerkurs (T1, T2, T4), maskinføreropplæring (M1–M6), kranfører (G4, G8, G11), HMS-kurs, arbeid på vei og andre sertifiserte kurs innenfor KKS AS sitt tilbud.",
  },
  {
    q: "Må jeg ta instruktørkurs først?",
    a: "Ja. Alle nye instruktører gjennomfører vårt interne instruktørkurs (50+ timer) der du lærer pedagogikk, kursgjennomføring, regelverk, HMS og bruk av dokumentasjonssystemene.",
  },
  {
    q: "Kan jeg jobbe som instruktør på deltid?",
    a: "Ja — du velger selv tilgjengeligheten din. Mange av våre instruktører kombinerer oppdrag hos KKS AS med annen jobb eller faglig virksomhet.",
  },
  {
    q: "Hvordan tar jeg kontakt?",
    a: "Ring oss på 91 54 08 24 — det er den raskeste veien. Du kan også sende en e-post til post@kksas.no med en kort beskrivelse av deg selv, så tar vi en prat.",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BliInstruktorPage() {
  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={[jobPostingSchema, faqSchema, breadcrumbSchema]} />
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2" aria-label="Brødsmulesti">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">Bli instruktør</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-amber-400/20 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-widest">
              <Briefcase className="h-3.5 w-3.5" />
              Ledige stillinger
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Bli instruktør<br className="hidden sm:block" /> hos KKS AS
            </h1>
            <p className="text-lg text-slate-300 mb-4 max-w-2xl">
              KKS AS søker dyktige instruktører innen <strong className="text-white">truck (T1, T2, T4)</strong>,{" "}
              <strong className="text-white">maskin (M1–M6)</strong>,{" "}
              <strong className="text-white">kran</strong> og{" "}
              <strong className="text-white">HMS</strong>. Fleksibel hverdag og{" "}
              <strong className="text-amber-400">veldig gode inntjeningsmuligheter</strong> — ring oss, så forteller vi mer.
            </p>
            <p className="text-slate-400 mb-8 max-w-2xl">
              Alle nye instruktører starter med vårt interne instruktørkurs (50+ timer), der du
              lærer alt du trenger for å holde profesjonelle, godkjente kurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#sok">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8">
                  Søk nå
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#om-rollen">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 px-8"
                >
                  Les mer om rollen
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ring oss-banner */}
      <section className="bg-amber-50 border-b border-amber-200 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-amber-800 font-medium">
              Lurer du på hvordan samarbeidet er lagt opp? Vi forteller deg alt over telefon.
            </p>
            <a
              href="tel:+4791540824"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <Phone className="h-4 w-4" />
              Ring 91 54 08 24
            </a>
          </div>
        </div>
      </section>

      {/* Hva vi tilbyr */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Hva vi tilbyr deg</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Vi gir deg alt du trenger for å lykkes som kursinstruktør — fra opplæring til ferdige kursopplegg.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {tilbyr.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Om rollen + krav */}
      <section id="om-rollen" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Arbeidsoppgaver</h2>
              </div>
              <ul className="space-y-3">
                {oppgaver.map((o) => (
                  <li key={o} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 text-sm leading-relaxed">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Krav til deg</h2>
              </div>
              <ul className="space-y-3">
                {krav.map((k) => (
                  <li key={k} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 text-sm leading-relaxed">{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Instruktøropplæring */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-amber-400/20 rounded-full text-amber-700 text-xs font-semibold">
                <GraduationCap className="h-3.5 w-3.5" />
                50+ timer
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Slik blir du instruktør</h2>
              <p className="text-slate-500">
                Alle nye instruktører gjennomfører vårt interne instruktørkurs. Her lærer du alt du
                trenger for å holde profesjonelle, godkjente kurs under KKS AS sine godkjenninger.
              </p>
            </div>
            <div className="bg-slate-950 rounded-2xl p-8">
              <div className="grid sm:grid-cols-2 gap-5">
                {opplaring.map((item, i) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-slate-400 leading-relaxed mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Godtgjørelse */}
      <section className="py-16 bg-amber-500">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Banknote className="h-12 w-12 mx-auto text-slate-950/60 mb-4" />
            <h2 className="text-3xl font-bold text-slate-950 mb-3">Veldig gode inntjeningsmuligheter</h2>
            <p className="text-slate-800 text-base mb-6 max-w-md mx-auto">
              Vi er opptatt av at instruktørene våre skal tjene godt. Detaljer om godtgjørelse
              deler vi gjerne over telefon — ring oss for en uforpliktende prat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+4791540824">
                <button className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
                  <Phone className="h-4 w-4" />
                  Ring 91 54 08 24
                </button>
              </a>
              <a href="mailto:post@kksas.no?subject=Interesse: Bli instruktør hos KKS AS">
                <button className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-slate-950 font-semibold px-8 py-3 rounded-xl transition-colors">
                  <Mail className="h-4 w-4" />
                  Send e-post
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — AEO-optimalisert */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Vanlige spørsmål om instruktørrollen
              </h2>
              <p className="text-slate-500">
                Her finner du svar på det de fleste lurer på før de søker.
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="border border-slate-200 rounded-xl p-5 hover:border-amber-300 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Søk nå */}
      <section id="sok" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Ta kontakt</h2>
              <p className="text-slate-500">
                Den raskeste veien er å ringe oss — så tar vi en uforpliktende prat om rollen,
                betingelser og hva vi kan tilby deg.
              </p>
            </div>
            <div className="bg-slate-950 rounded-2xl p-8 text-center">
              <p className="text-white font-semibold text-lg mb-2">Ring oss direkte</p>
              <a
                href="tel:+4791540824"
                className="inline-flex items-center gap-3 text-amber-400 text-3xl font-bold hover:text-amber-300 transition-colors mb-6"
              >
                <Phone className="h-7 w-7" />
                91 54 08 24
              </a>
              <p className="text-slate-400 text-sm mb-6">
                Foretrekker du e-post? Send en kort beskrivelse av deg selv, så ringer vi deg tilbake.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="mailto:post@kksas.no?subject=Interesse: Bli instruktør hos KKS AS">
                  <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 h-12">
                    <Mail className="mr-2 h-4 w-4" />
                    Send e-post
                  </Button>
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-5">
                <a href="mailto:post@kksas.no" className="text-amber-400 hover:underline">
                  post@kksas.no
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
