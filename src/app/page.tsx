import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateFAQSchema,
  generateHowToSchema,
  generateSpeakableSchema,
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
} from "lucide-react";
import { getCourseCategoryLabel } from "@/lib/course-categories";
import { FaqAccordion } from "@/components/public/FaqAccordion";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "Truckkurs, Krankurs, HMS-kurs og Stillasmontørkurs i Norge | KKS AS",
  description:
    "KKS AS tilbyr godkjent og sertifisert opplæring innen truck, kran, stillas, HMS og BHT i hele Norge. Erfarne instruktører, ISO 9001-sertifisert. Meld deg på i dag.",
  alternates: {
    canonical: BASE_URL,
  },
};

const categories = [
  {
    title: getCourseCategoryLabel("digitale-kurs"),
    icon: Laptop,
    description: "Nettbasert opplæring du kan ta når det passer",
    href: "/kurs?category=digitale-kurs",
  },
  {
    title: getCourseCategoryLabel("truck"),
    icon: Truck,
    description: "Sertifisert opplæring i truckkjøring",
    href: "/kurs?category=truck",
  },
  {
    title: getCourseCategoryLabel("kran"),
    icon: Construction,
    description: "Profesjonell kranføreropplæring",
    href: "/kurs?category=kran",
  },
  {
    title: getCourseCategoryLabel("stillas"),
    icon: HardHat,
    description: "Sikker bruk av stillas",
    href: "/kurs?category=stillas",
  },
  {
    title: getCourseCategoryLabel("hms"),
    icon: ShieldCheck,
    description: "Helse, miljø og sikkerhet",
    href: "/kurs?category=hms",
  },
];

const benefits = [
  {
    icon: Award,
    title: "Sertifiserte kurs",
    description: "Alle våre kurs er godkjent av Arbeidstilsynet og følger gjeldende lover og forskrifter"
  },
  {
    icon: Users,
    title: "Erfarne instruktører",
    description: "Våre instruktører har solid erfaring og ekspertise innen sine fagfelt"
  },
  {
    icon: Target,
    title: "Skreddersydde løsninger",
    description: "Vi tilpasser kursene til din bedrifts spesifikke behov og krav"
  },
  {
    icon: TrendingUp,
    title: "Kontinuerlig oppdatering",
    description: "Kursene våre holder seg oppdatert med siste standarder og beste praksis"
  },
  {
    icon: Star,
    title: "Høy kvalitet",
    description: "Følger ISO 9001-standarden for kvalitetssikring av alle våre tjenester"
  },
  {
    icon: Zap,
    title: "Fleksible løsninger",
    description: "Kurs både digitalt og fysisk, tilpasset dine behov og tidsplan"
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
    question: "Hva er KKS AS?",
    answer: "KKS AS (Kurs og Kompetansesystemer AS) er en norsk kursleverandør grunnlagt i 2020. Vi tilbyr sertifisert yrkesopplæring innen truck, kran, stillas, arbeid på vei, HMS og BHT-opplæring i hele Norge. Vi er ISO 9001- og ISO 27001-sertifisert og godkjent av Arbeidstilsynet.",
  },
  {
    question: "Hvilke kurs tilbyr KKS AS?",
    answer: "KKS AS tilbyr truckfører kurs (T1–T8), kranfører kurs (G4, G8, G11), stillasmontørkurs (2–9 meter og over 9 meter), HMS grunnkurs og verneombudskurs, arbeid på vei og arbeidsvarslingskurs, BHT-obligatorisk kurs, maskinføreropplæring (M1–M6), personløfter, fallsikring og en rekke spesialkurs.",
  },
  {
    question: "Er kursene til KKS AS godkjent av Arbeidstilsynet?",
    answer: "Ja. Alle kurs hos KKS AS er godkjent og følger Arbeidstilsynets krav og retningslinjer. Vi er i tillegg ISO 9001:2015-sertifisert for kvalitetssikring og ISO 27001:2013-sertifisert for informasjonssikkerhet.",
  },
  {
    question: "Hvor holder KKS AS kurs i Norge?",
    answer: "KKS AS tilbyr kurs i hele Norge, inkludert Oslo, Bergen, Trondheim, Stavanger, Kristiansand og Tromsø. Vi kan også komme ut til din bedrift og gjennomføre kurs på stedet hvis dere har egnede lokaler.",
  },
  {
    question: "Hva koster et truckkurs hos KKS AS?",
    answer: "Prisene varierer etter kurstype og varighet. Se vår kursoversikt på kksas.no for oppdatert prisinformasjon. Bedrifter kan ta kontakt for å avtale skreddersydde bedriftspakker og volumbetingelser.",
  },
  {
    question: "Får jeg kursbevis etter gjennomført kurs?",
    answer: "Ja. Etter bestått eksamen mottar du et offisielt kompetansebevis fra KKS AS. Beviset dokumenterer din sertifisering og er godkjent i henhold til Arbeidstilsynets krav.",
  },
  {
    question: "Tilbyr KKS AS bedriftskurs og skreddersydde opplæringsprogram?",
    answer: "Ja. KKS AS tilbyr skreddersydde kursopplegg for bedrifter. Vi kan gjennomføre kurs hos din bedrift, tilpasse innholdet til din bransje og fakturere direkte. Kontakt oss på +47 91 54 08 24 eller post@kksas.no.",
  },
  {
    question: "Hva er BHT-opplæring og hvem trenger det?",
    answer: "BHT (bedriftshelsetjeneste) er en lovpålagt tjeneste for mange norske virksomheter. Obligatorisk BHT-kurs er påkrevd for ansatte i bedriftshelsetjenesten og gir nødvendig kompetanse innen arbeidsmiljø og helsevern. KKS AS tilbyr dette kurset i samarbeid med Dr Dropin.",
  },
  {
    question: "Kan KKS AS hjelpe med HMS-system for bedrifter?",
    answer: "Ja. Gjennom vårt BHT-medlemskap får din bedrift tilgang til HMS Nova — et komplett digitalt HMS-system — for 499 kr/mnd, i tillegg til 10 % rabatt på BHT-tjenester via Dr Dropin og en dedikert HMS-rådgiver.",
  },
  {
    question: "Hvordan melder jeg meg på et kurs hos KKS AS?",
    answer: "Gå til kksas.no/kurs, velg ønsket kurs og kursdato, fyll ut påmeldingsskjemaet med navn og e-post, og bekreft påmeldingen. Du mottar en bekreftelse på e-post. Kontakt oss på post@kksas.no eller +47 91 54 08 24 ved spørsmål.",
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

  return (
    <div className="min-h-screen">
      <StructuredData data={[faqSchema, howToSchema, speakableSchema]} />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Truckkurs, Krankurs, HMS og Stillasmontørkurs i Norge
            </h1>
            <p className="speakable-summary text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Godkjent og sertifisert opplæring innen truck, kran, stillas, arbeid på vei og BHT-opplæring.
              Erfarne instruktører i hele Norge — din partner for faglig utvikling og sikkert arbeid.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kurs">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg">
                  Se alle kurs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/bedrift">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 text-lg">
                  Kurs for bedrifter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Om KKS Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Kvalitet og trygghet i læring</h2>
              <p className="text-xl text-muted-foreground">
                Din partner for profesjonell opplæring og kompetanseutvikling
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                  Hos <strong>KKS AS</strong> er vi stolte av å være en ledende leverandør 
                  av kurs og kompetansesystemer i Norge. Vi har et sterkt fokus på kvalitet og 
                  sikrer at alle våre kurs følger <strong>Arbeidstilsynets</strong> strenge krav og retningslinjer.
                </p>
                <p className="text-lg leading-relaxed">
                  Vårt mål er å gi våre kunder den tryggheten som kommer med å vite at de har fått 
                  opplæring som ikke bare er oppdatert og relevant, men også <strong>fullt ut i tråd 
                  med lovverket</strong>.
                </p>
                <div className="pt-4">
                  <Link href="/om-oss">
                    <Button size="lg" variant="outline">
                      Les mer om oss
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-6">Vår visjon</h3>
                <p className="text-lg leading-relaxed mb-6">
                  Vi er dedikert til å levere kurs av høyeste kvalitet som gir <strong>varig kompetanse</strong> og 
                  øker sikkerheten på arbeidsplassen. Vi forstår viktigheten av god opplæring, og vi er 
                  her for å støtte både enkeltpersoner og bedrifter i deres læringsreise.
                </p>
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                  <span className="font-semibold">Følger ISO 9001-standarden</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Populære kurskategorier</h2>
            <p className="text-xl text-muted-foreground">
              Finn det kurset som passer for deg eller din bedrift
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link key={category.title} href={category.href}>
                <Card className="h-full hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-2 hover:border-primary">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <category.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription className="text-base">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-primary font-semibold flex items-center">
                      Se kurs
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Hvorfor velge KKS AS?</h2>
            <p className="text-xl text-muted-foreground">
              Vi setter din sikkerhet og kompetanse i fokus
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  <CardDescription className="text-base">{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BHT-medlemskap CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-2 border-blue-200 dark:border-blue-800 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl md:text-4xl mb-3">Bli BHT-medlem hos KKS AS</CardTitle>
              <CardDescription className="text-lg md:text-xl">
                Få tilgang til BHT via Dr Dropin med <strong className="text-foreground">10% rabatt</strong> og HMS Nova for kun <strong className="text-foreground">499kr/mnd</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">10% rabatt på BHT-tjenester</div>
                    <div className="text-sm text-muted-foreground">Spar penger på viktige helsetjenester</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">HMS Nova inkludert (499kr/mnd)</div>
                    <div className="text-sm text-muted-foreground">Komplett HMS-system</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Dedikert HMS-rådgiver</div>
                    <div className="text-sm text-muted-foreground">Personlig støtte når du trenger det</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Følger ISO 9001-standarden</div>
                    <div className="text-sm text-muted-foreground">Kvalitetssikret system</div>
                  </div>
                </div>
              </div>
              <div className="text-center pt-4">
                <Link href="/bht-medlem">
                  <Button size="lg" className="w-full sm:w-auto text-lg">
                    Les mer og meld deg på
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section — AI og søkemotoroptimalisert */}
      <section className="faq-section py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <HelpCircle className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Ofte stilte spørsmål</h2>
              <p className="text-xl text-muted-foreground">
                Alt du trenger å vite om kurs og opplæring hos KKS AS
              </p>
            </div>
            <FaqAccordion items={homepageFaqs} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Calendar className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Klar til å komme i gang?</h2>
            <p className="text-xl text-white/90 mb-8">
              Finn ditt neste kurs og ta steget mot økt kompetanse og sikkerhet i dag
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kurs">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg">
                  Utforsk alle kurs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 text-lg">
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
