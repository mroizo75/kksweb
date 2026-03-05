import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Om KKS AS — ISO-sertifisert kursleverandør for truck, kran og HMS i Norge",
  description:
    "KKS AS (Kurs og Kompetansesystemer) er en ISO 9001-sertifisert norsk kursleverandør godkjent av Arbeidstilsynet. Vi tilbyr truck-, kran-, stillas-, HMS- og BHT-kurs med erfarne instruktører over hele Norge.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no"}/om-oss`,
  },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Kvalitetssikrede kurs",
    description: "Alle kurs følger Arbeidstilsynets strenge krav. Vi er ISO 9001:2015-sertifisert og gjennomfører intern revisjon av kursinnhold og instruktørers kompetanse.",
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
    description: "Truckfører (T1–T8), kranfører (G4, G8, G11), stillasmontør, maskinføreropplæring (M1–M6), personløfter og fallsikring. Alle kurs er godkjent av Arbeidstilsynet og gir offisielt kompetansebevis.",
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
    title: "ISO-sertifisering og digitalisering",
    description: "Oppnådde ISO 9001:2015 (kvalitetsledelse) og ISO 27001:2013 (informasjonssikkerhet). Lanserte digital kursplattform og BHT-medlemskapsprogram.",
  },
];

const keyFacts = [
  { label: "Grunnlagt", value: "2020" },
  { label: "Antall kurs gjennomført", value: "500+" },
  { label: "Fornøyde deltakere", value: "2000+" },
  { label: "Kurstyper", value: "40+" },
  { label: "ISO-sertifiseringer", value: "2 (9001 og 27001)" },
  { label: "Åpningstider", value: "Man–Fre 08:00–16:00" },
  { label: "Telefon", value: "+47 91 54 08 24" },
  { label: "E-post", value: "post@kksas.no" },
];

const omOssFaqs = [
  {
    question: "Hvem er KKS AS?",
    answer: "KKS AS (Kurs og Kompetansesystemer AS) er en norsk kursleverandør grunnlagt i 2020. Vi er ISO 9001- og ISO 27001-sertifisert og godkjent av Arbeidstilsynet. Vi tilbyr yrkesopplæring og sertifisering innen truck, kran, stillas, HMS, arbeid på vei og BHT i hele Norge.",
  },
  {
    question: "Er KKS AS godkjent av Arbeidstilsynet?",
    answer: "Ja. Alle kurs hos KKS AS er godkjent av Arbeidstilsynet og følger kravene i arbeidsmiljøloven og tilhørende forskrifter. Vi er i tillegg ISO 9001:2015-sertifisert for kvalitetssikring av kursinnhold og gjennomføring.",
  },
  {
    question: "Hvilke sertifiseringer har KKS AS?",
    answer: "KKS AS har ISO 9001:2015 (kvalitetsledelsessystem), ISO 27001:2013 (informasjonssikkerhet) og er godkjent kursleverandør av Arbeidstilsynet. Selskapet ble grunnlagt i 2020 og har siden vokst til å tilby over 40 ulike kurstyper i hele Norge.",
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
    <div className="min-h-screen">
      <StructuredData data={[faqSchema, speakableSchema]} />
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-700 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Om KKS AS
            </h1>
            <p className="entity-summary text-xl md:text-2xl text-blue-100 leading-relaxed">
              KKS AS (Kurs og Kompetansesystemer AS) er en ISO 9001-sertifisert norsk kursleverandør godkjent av Arbeidstilsynet. Vi har siden 2020 tilbudt sertifisert yrkesopplæring innen truck, kran, stillas, HMS og BHT i hele Norge.
            </p>
          </div>
        </div>
      </section>

      {/* Nøkkelfakta — E-E-A-T og AI-sitérbar faktaboks */}
      <section className="py-12 bg-primary/5 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Nøkkelfakta om KKS AS</h2>
            <dl className="key-facts grid grid-cols-2 md:grid-cols-4 gap-4">
              {keyFacts.map((fact) => (
                <div key={fact.label} className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-sm">
                  <dt className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{fact.label}</dt>
                  <dd className="font-bold text-primary text-lg">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Kontaktinfo */}
      <section className="py-10 bg-white dark:bg-gray-950 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <a href="tel:+4791540824" className="hover:text-primary">+47 91 54 08 24</a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:post@kksas.no" className="hover:text-primary">post@kksas.no</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Hele Norge</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">Hvem er KKS AS?</h2>
              <p className="text-xl leading-relaxed mb-6">
                <strong>KKS AS (Kurs og Kompetansesystemer AS)</strong> er en norsk kursleverandør grunnlagt i 2020.
                Vi er godkjent av <strong>Arbeidstilsynet</strong> og tilbyr sertifisert yrkesopplæring til bedrifter og
                enkeltpersoner i hele Norge. Selskapet er ISO 9001:2015-sertifisert for kvalitet og ISO 27001:2013-sertifisert
                for informasjonssikkerhet.
              </p>
              <p className="text-xl leading-relaxed mb-6">
                Vi spesialiserer oss på <strong>truckkurs</strong> (T1–T8), <strong>krankurs</strong> (G4, G8, G11),
                <strong> stillasopplæring</strong>, <strong>HMS-kurs</strong>, <strong>arbeid på vei</strong> og
                <strong> BHT-opplæring</strong>. Alle kurs gir offisielt kompetansebevis godkjent i henhold til
                Arbeidstilsynets krav og arbeidsmiljøloven.
              </p>
              <p className="text-xl leading-relaxed mb-6">
                KKS AS har til nå gjennomført over <strong>500 kurs</strong> for mer enn <strong>2000 deltakere</strong>
                fra bygg- og anleggsbransjen, industri, transport og logistikk. Vi tilbyr kurs i Oslo, Bergen, Trondheim,
                Stavanger, Kristiansand og Tromsø, samt bedriftsinterne kurs over hele landet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visjon */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Target className="h-16 w-16 mx-auto text-primary mb-6" />
            <h2 className="text-4xl font-bold mb-6">Vår visjon</h2>
            <p className="text-xl leading-relaxed">
              KKS AS skal være Norges mest pålitelige leverandør av yrkessertifisering og HMS-opplæring.
              Vi leverer kurs av høyeste kvalitet som gir <strong>varig kompetanse</strong> og øker sikkerheten
              på arbeidsplassen — for enkeltpersoner, fagarbeidere og bedrifter i alle bransjer.
            </p>
          </div>
        </div>
      </section>

      {/* Tjenester */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Hva tilbyr KKS AS?</h2>
            <p className="text-xl text-muted-foreground">
              Komplett kursportefølje for norske bedrifter og arbeidstakere
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service) => (
              <Card key={service.title} className="border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/kurs">
              <Button size="lg">
                Se alle kurs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Våre verdier */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Våre verdier</h2>
            <p className="text-xl text-muted-foreground">
              Prinsippene som styrer alt vi gjør
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Historie/Tidslinje */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Vår historie</h2>
              <p className="text-xl text-muted-foreground">
                Fra oppstart i 2020 til godkjent, ISO-sertifisert kursleverandør i hele Norge.
              </p>
            </div>

            <div className="space-y-8">
              {timeline.map((event, index) => (
                <div key={event.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {event.year}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-1 bg-primary/20 flex-1 mt-2" />
                    )}
                  </div>
                  <Card className="flex-1 mb-4">
                    <CardHeader>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="text-base">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sertifiseringer */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <ShieldCheck className="h-16 w-16 mx-auto text-primary mb-6" />
              <h2 className="text-4xl font-bold mb-4">Sertifiseringer og godkjenninger</h2>
              <p className="text-xl text-muted-foreground mb-8">
                KKS AS oppfyller de høyeste standardene innen kvalitet, sikkerhet og informasjonsvern
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    ISO 9001:2015
                  </CardTitle>
                  <CardDescription>
                    Kvalitetsledelsessystem. Sikrer at alle prosesser, kursinnhold og gjennomføringer holder høyeste kvalitet og er gjenstand for løpende forbedring.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    ISO 27001:2013
                  </CardTitle>
                  <CardDescription>
                    Informasjonssikkerhetssystem. Beskytter deltakernes personopplysninger og bedriftens data i henhold til GDPR og norsk personvernlovgivning.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Godkjent av Arbeidstilsynet
                  </CardTitle>
                  <CardDescription>
                    Alle kurs er godkjent av Arbeidstilsynet og oppfyller kravene i arbeidsmiljøloven og tilhørende forskrifter om opplæring og sertifisering av operatører.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    FNs bærekraftsmål
                  </CardTitle>
                  <CardDescription>
                    Vi integrerer FNs bærekraftsmål i opplæring og drift. Særlig SDG 4 (kvalitetsutdanning) og SDG 8 (anstendig arbeid og økonomisk vekst).
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — AI-optimalisert */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <HelpCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-4">Spørsmål om KKS AS</h2>
              <p className="text-lg text-muted-foreground">
                Svar på de vanligste spørsmålene om hvem vi er og hva vi tilbyr
              </p>
            </div>
            <div className="space-y-4">
              {omOssFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-6 bg-gray-50 dark:bg-gray-900 hover:border-primary/30 transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
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
