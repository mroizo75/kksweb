import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateFAQSchema, generateSpeakableSchema } from "@/lib/seo/schema";
import {
  ShieldCheck,
  Award,
  Users,
  Target,
  TrendingUp,
  Lightbulb,
  Heart,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Om KKS AS — Sertifisert opplæringsvirksomhet for truck, kran og HMS i Norge",
  description:
    "KKS AS (Kurs og Kompetansesystemer) er en sertifisert opplæringsvirksomhet godkjent av Norsk Sertifisering og Arbeidstilsynet. Vi tilbyr truck- (T1, T2, T4), kran-, stillas-, HMS- og BHT-kurs over hele Norge.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no"}/om-oss`,
  },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Kvalitetssikrede kurs",
    description: "Alle kurs følger Arbeidstilsynets strenge krav. Vi er godkjent som sertifisert opplæringsvirksomhet av Norsk Sertifisering og gjennomfører intern revisjon av kursinnhold og instruktørers kompetanse.",
  },
  {
    icon: Users,
    title: "Tilpasningsevne",
    description: "Uansett bransje eller behov kan vi skreddersy kurs som passer for deg eller din bedrift. Vi gjennomfører kurs i hele Norge og kan komme til din arbeidsplass.",
  },
  {
    icon: TrendingUp,
    title: "Dokumentert erfaring",
    description: "KKS AS har siden 2020 gjennomført over 500 kurs for mer enn 2000 deltakere fra bygg, industri, anlegg og logistikk.",
  },
  {
    icon: Globe,
    title: "Bærekraft",
    description: "Vi integrerer FNs bærekraftsmål i vår opplæring og drift, med særlig fokus på SDG 4 (kvalitetsutdanning) og SDG 8 (anstendig arbeid).",
  },
];

const services = [
  {
    icon: Award,
    title: "Sertifiserte kurs",
    description: "Truckfører (T1, T2, T4), kranfører (G4, G8, G11), stillasmontør, maskinføreropplæring (M1–M6), personløfter og fallsikring. Alle kurs er godkjent av Arbeidstilsynet og gir offisielt kompetansebevis.",
  },
  {
    icon: Lightbulb,
    title: "HMS og sikkerhetskurs",
    description: "Grunnkurs HMS, verneombudskurs (40 timer), arbeid på vei, arbeidsvarsling, brannvern og spesialkurs som YSK og diisocyanater. Kurs som oppfyller lovkrav i arbeidsmiljøloven.",
  },
  {
    icon: Heart,
    title: "BHT-opplæring",
    description: "Obligatorisk BHT-kurs for ansatte i bedriftshelsetjenesten. Vi samarbeider med Dr Dropin og tilbyr BHT-medlemskap som inkluderer HMS Nova og dedikert HMS-rådgiver.",
  },
  {
    icon: Users,
    title: "Bedriftsinterne kurs",
    description: "Vi skreddersyr kursopplegg og gjennomfører opplæring direkte hos din bedrift. Fakturering mot bedrift. Tilpasning til din bransje, ditt utstyr og dine arbeidsprosesser.",
  },
];

const timeline = [
  {
    year: "2020",
    title: "Starten",
    description: "KKS AS (Kurs og Kompetansesystemer AS) ble grunnlagt med mål om å tilby godkjent HMS- og sikkerhetsopplæring til norske bedrifter og arbeidstakere.",
  },
  {
    year: "2021",
    title: "Godkjent kursleverandør",
    description: "Ble offisielt godkjent som kursleverandør av Arbeidstilsynet og etablerte stabile rutiner for kvalitetssikring av kursinnhold og instruktørers kompetanse.",
  },
  {
    year: "2024",
    title: "Ekspansjon til hele Norge",
    description: "Utvidet tilbudet til truck-, kran-, stillas- og maskinfører-kurs. KKS AS gjennomfører nå kurs i alle større norske byer samt bedriftsintern opplæring over hele landet.",
  },
  {
    year: "2025",
    title: "Godkjent opplæringsvirksomhet og digitalisering",
    description: "Godkjent som sertifisert opplæringsvirksomhet av Norsk Sertifisering. Lanserte digital kursplattform og BHT-medlemskapsprogram. Jobber aktivt mot ISO 9001-sertifisering.",
  },
];

const keyFacts = [
  { label: "Grunnlagt", value: "2020" },
  { label: "Kurs gjennomført", value: "500+" },
  { label: "Fornøyde deltakere", value: "2000+" },
  { label: "Kurstyper", value: "40+" },
  { label: "Godkjent av", value: "Norsk Sertifisering" },
  { label: "Åpningstider", value: "Man–Fre 08–16" },
  { label: "Telefon", value: "+47 91 54 08 24" },
  { label: "E-post", value: "post@kksas.no" },
];

const certifications = [
  {
    title: "Sertifisert opplæringsvirksomhet — Norsk Sertifisering",
    description: "KKS AS er godkjent som sertifisert opplæringsvirksomhet av Norsk Sertifisering. Det betyr at kursinnhold, gjennomføring og kompetansebevis holder de høyeste faglige kravene.",
  },
  {
    title: "ISO 9001:2015-standard",
    description: "Vi følger ISO 9001:2015 i alt vi gjør — kvalitetsstyring, prosessforbedring og intern revisjon av kursinnhold og instruktørers kompetanse. Sertifisering er under arbeid.",
  },
  {
    title: "Godkjent av Arbeidstilsynet",
    description: "Alle kurs er godkjent av Arbeidstilsynet og oppfyller kravene i arbeidsmiljøloven og tilhørende forskrifter om opplæring og sertifisering av operatører.",
  },
  {
    title: "FNs bærekraftsmål",
    description: "Vi integrerer FNs bærekraftsmål i opplæring og drift. Særlig SDG 4 (kvalitetsutdanning) og SDG 8 (anstendig arbeid og økonomisk vekst).",
  },
];

const omOssFaqs = [
  {
    question: "Hvem er KKS AS?",
    answer: "KKS AS (Kurs og Kompetansesystemer AS) er en norsk kursleverandør grunnlagt i 2020. Vi er en sertifisert opplæringsvirksomhet godkjent av Norsk Sertifisering og Arbeidstilsynet. Vi tilbyr opplæring innen truck (T1, T2, T4), kran, stillas, HMS, arbeid på vei og BHT i hele Norge.",
  },
  {
    question: "Er KKS AS godkjent av Arbeidstilsynet?",
    answer: "Ja. Alle kurs hos KKS AS er godkjent av Arbeidstilsynet og følger kravene i arbeidsmiljøloven og tilhørende forskrifter. Vi er i tillegg godkjent som sertifisert opplæringsvirksomhet av Norsk Sertifisering og følger ISO 9001:2015-standarden i all kursgjennomføring.",
  },
  {
    question: "Hvilke sertifiseringer har KKS AS?",
    answer: "KKS AS er godkjent som sertifisert opplæringsvirksomhet av Norsk Sertifisering og godkjent kursleverandør av Arbeidstilsynet. Vi følger ISO 9001:2015-standarden i alt vi gjør og jobber aktivt mot full ISO-sertifisering. Selskapet ble grunnlagt i 2020 og tilbyr nå over 40 kurstyper i hele Norge.",
  },
  {
    question: "Hvor i Norge tilbyr KKS AS kurs?",
    answer: "KKS AS tilbyr kurs i Oslo, Bergen, Trondheim, Stavanger, Kristiansand, Tromsø og ellers over hele Norge. Vi kan også reise til din bedrift og gjennomføre kurs på stedet.",
  },
  {
    question: "Kan bedrifter kjøpe skreddersydde kursopplegg fra KKS AS?",
    answer: "Ja. Vi tilbyr bedriftsinterne kurs tilpasset din bransje og dine arbeidsprosesser. Vi fakturerer direkte mot bedriften. Ta kontakt på +47 91 54 08 24 eller post@kksas.no for et uforpliktende tilbud.",
  },
];

export default function OmOssPage() {
  const faqSchema = generateFAQSchema(omOssFaqs);
  const speakableSchema = generateSpeakableSchema(["h1", ".entity-summary", ".key-facts"]);

  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={[faqSchema, speakableSchema]} />
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">Om oss</span>
          </nav>
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Om KKS AS
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Norges ledende<br className="hidden sm:block" /> kursleverandør
            </h1>
            <p className="entity-summary text-lg text-slate-300 leading-relaxed max-w-2xl">
              KKS AS (Kurs og Kompetansesystemer AS) er en norsk kursleverandør godkjent av Arbeidstilsynet og sertifisert opplæringsvirksomhet av Norsk Sertifisering. Vi har siden 2020 tilbudt opplæring innen truck (T1, T2, T4), kran, stillas, HMS og BHT i hele Norge.
            </p>
          </div>
        </div>
      </section>

      {/* Key facts */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4">
          <dl className="key-facts grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="bg-white rounded-xl p-4 text-center border border-slate-200">
                <dt className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{fact.label}</dt>
                <dd className="font-bold text-amber-600 text-lg">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Contact bar */}
      <section className="py-6 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-500" />
              <a href="tel:+4791540824" className="hover:text-amber-600">+47 91 54 08 24</a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-500" />
              <a href="mailto:post@kksas.no" className="hover:text-amber-600">post@kksas.no</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>Hele Norge</span>
            </div>
          </div>
        </div>
      </section>

      {/* About text */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Hvem er KKS AS?</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900">KKS AS (Kurs og Kompetansesystemer AS)</strong> er en norsk kursleverandør grunnlagt i 2020.
                Vi er godkjent av <strong className="text-slate-900">Arbeidstilsynet</strong> og er en{" "}
                <strong className="text-slate-900">sertifisert opplæringsvirksomhet av Norsk Sertifisering</strong>.
                I alt vi gjør følger vi ISO 9001:2015-standarden for kvalitetsstyring.
              </p>
              <p>
                Vi spesialiserer oss på <strong className="text-slate-900">truckkurs</strong> (T1, T2, T4), <strong className="text-slate-900">krankurs</strong> (G4, G8, G11),
                <strong className="text-slate-900"> stillasopplæring</strong>, <strong className="text-slate-900">HMS-kurs</strong>, <strong className="text-slate-900">arbeid på vei</strong> og
                <strong className="text-slate-900"> BHT-opplæring</strong>. Alle kurs gir offisielt kompetansebevis godkjent i henhold til
                Arbeidstilsynets krav og arbeidsmiljøloven.
              </p>
              <p>
                KKS AS har til nå gjennomført over <strong className="text-slate-900">500 kurs</strong> for mer enn <strong className="text-slate-900">2000 deltakere</strong>
                {" "}fra bygg- og anleggsbransjen, industri, transport og logistikk. Vi tilbyr kurs i Oslo, Bergen, Trondheim,
                Stavanger, Kristiansand og Tromsø, samt bedriftsinterne kurs over hele landet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-amber-50 border-y border-amber-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Target className="h-14 w-14 mx-auto text-amber-500 mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-5">Vår visjon</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              KKS AS skal være Norges mest pålitelige leverandør av yrkessertifisering og HMS-opplæring.
              Vi leverer kurs av høyeste kvalitet som gir <strong>varig kompetanse</strong> og øker sikkerheten
              på arbeidsplassen — for enkeltpersoner, fagarbeidere og bedrifter i alle bransjer.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Hva tilbyr KKS AS?</h2>
            <p className="text-slate-500">Komplett kursportefølje for norske bedrifter og arbeidstakere</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/kurs">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8">
                Se alle kurs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Våre verdier</h2>
            <p className="text-slate-500">Prinsippene som styrer alt vi gjør</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:border-amber-300 transition-all">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Vår historie</h2>
              <p className="text-slate-500">Fra oppstart i 2020 til sertifisert opplæringsvirksomhet i hele Norge.</p>
            </div>
            <div className="space-y-0">
              {timeline.map((event, index) => (
                <div key={event.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs flex-shrink-0 z-10">
                      {event.year}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 bg-amber-200 flex-1 mt-1 mb-1 min-h-[2rem]" />
                    )}
                  </div>
                  <div className={`pb-8 pt-2 flex-1 ${index < timeline.length - 1 ? "" : ""}`}>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <ShieldCheck className="h-14 w-14 mx-auto text-amber-500 mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Sertifiseringer og godkjenninger</h2>
              <p className="text-slate-500">
                KKS AS oppfyller de høyeste standardene innen kvalitet, sikkerhet og informasjonsvern
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {certifications.map((cert) => (
                <div key={cert.title} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 transition-all">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{cert.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{cert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Spørsmål om KKS AS</h2>
              <p className="text-slate-500">
                Svar på de vanligste spørsmålene om hvem vi er og hva vi tilbyr
              </p>
            </div>
            <div className="space-y-4">
              {omOssFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl p-5 hover:border-amber-300 transition-colors"
                >
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
