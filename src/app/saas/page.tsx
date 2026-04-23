import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check,
  X,
  Code,
  Clock,
  Euro,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  ShoppingCart,
  GraduationCap,
  ClipboardCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata = {
  title: "SaaS-løsninger - Leie Software istedenfor å Bygge | KKS AS",
  description: "Få ditt eget booking system, LMS, CRM eller annet skreddersydd software for kun 5000 kr/mnd. Ingen store utviklingskostnader. Følger ISO standarder. Full support.",
  keywords: "booking system, kurssystem, LMS, software leie, SaaS, software as a service, bestillingssystem, CRM system, HMS system",
  alternates: {
    canonical: `${BASE_URL}/saas`,
  },
};

const painPoints = [
  {
    icon: Euro,
    title: "Høye utviklingskostnader",
    problem: "Utvikling kan koste 200 000 - 500 000 kr",
    solution: "Betal kun 5000 kr/mnd for et ferdig system",
  },
  {
    icon: Clock,
    title: "Lang utviklingstid",
    problem: "6-12 måneder fra idé til lansering",
    solution: "I gang på 1-2 uker med tilpasset løsning",
  },
  {
    icon: Code,
    title: "Teknisk kompleksitet",
    problem: "Trenger utviklere, servere, vedlikehold",
    solution: "Vi håndterer alt teknisk - du fokuserer på kunde",
  },
  {
    icon: Shield,
    title: "Sikkerhet og GDPR",
    problem: "Kostbart å bygge sikkerhet og følge lover",
    solution: "Følger ISO standarder med innebygd GDPR-compliance",
  },
  {
    icon: TrendingUp,
    title: "Skalerbarhet",
    problem: "Systemet må vokse med bedriften",
    solution: "Cloud-basert infrastruktur som skalerer automatisk",
  },
  {
    icon: AlertCircle,
    title: "Oppdateringer og support",
    problem: "Kontinuerlig vedlikehold og support koster",
    solution: "Inkludert i prisen med 24/7 support",
  },
];

const solutions = [
  {
    icon: ShoppingCart,
    name: "Booking System",
    description: "Komplett bestillingssystem for servicebedrifter, bilpleie, frisører, håndverkere og mer.",
    features: [
      "Online booking 24/7",
      "Kalenderintegrasjon",
      "SMS og e-post varsling",
      "Betalingsintegrasjon (Vipps/Stripe)",
      "Kundeadministrasjon",
      "Pakke/tjeneste-styring",
      "Rapporter og statistikk",
      "Mobilapp (valgfritt)",
    ],
    price: "Fra 5 000 kr/mnd",
    example: "Som Svampen.no - profesjonell bil- og båtpleie",
    caseStudyUrl: "https://www.svampen.no",
  },
  {
    icon: GraduationCap,
    name: "Kurssystem (LMS)",
    description: "Komplett Learning Management System for kursarrangører, opplæringsselskaper og organisasjoner.",
    features: [
      "Kurskatalog med påmelding",
      "Sesjonsstyring og kalender",
      "Deltakeradministrasjon",
      "Digitale kompetansebevis",
      "Betalingsløsninger",
      "E-post automatisering",
      "Rapporter og statistikk",
      "CRM integrasjon",
    ],
    price: "Fra 8 000 kr/mnd",
    example: "Som KKS AS - Norges største HMS-kursarrangør",
    caseStudyUrl: "https://www.kksas.no/kurs",
  },
  {
    icon: Users,
    name: "CRM System",
    description: "Komplett Customer Relationship Management for salgsteam og kundehåndtering.",
    features: [
      "Lead management",
      "Deal pipeline",
      "Aktivitetsstyring",
      "Fornyelseshåndtering",
      "E-post integrasjon",
      "Rapporter og forecasting",
      "Automatisering",
      "API integrasjoner",
    ],
    price: "Fra 6 000 kr/mnd",
    example: "Integrert i KKS AS for salg og oppfølging",
    caseStudyUrl: "/bedrift",
  },
  {
    icon: ClipboardCheck,
    name: "HMS System",
    description: "Komplett HMS-system for avvikshåndtering, risiko og dokumentasjon.",
    features: [
      "Avvikshåndtering",
      "Risikovurdering",
      "Dokumenthåndtering",
      "KPI og målstyring",
      "Audit trails",
      "Mobile løsninger",
      "Følger ISO 9001 / ISO 27001",
      "Automatiske varslinger",
    ],
    price: "Fra 7 000 kr/mnd",
    example: "ISO-sertifisert kvalitetssystem",
    caseStudyUrl: "/bedrift",
  },
  {
    icon: Calendar,
    name: "Event Management",
    description: "Komplett system for arrangement, billettsalg og deltakerhåndtering.",
    features: [
      "Billettsalg online",
      "Arrangement-katalog",
      "Deltaker-registrering",
      "Betalingsløsninger",
      "Check-in system",
      "E-post kommunikasjon",
      "Rapporter og analyse",
      "Markedsføringsverktøy",
    ],
    price: "Fra 6 000 kr/mnd",
    example: "Som Arrango.no - ticket marketplace",
    caseStudyUrl: "https://www.arrango.no",
  },
  {
    icon: Sparkles,
    name: "Skreddersydd Løsning",
    description: "Vi bygger et system tilpasset dine spesifikke behov og bransje.",
    features: [
      "Behovsanalyse",
      "Skreddersydd design",
      "Integrasjoner etter ønske",
      "Egen branding",
      "Tilpasset funksjonalitet",
      "Dedikert support",
      "Eget domene",
      "Full kontroll",
    ],
    price: "Fra 10 000 kr/mnd",
    example: "Kontakt oss for en uforpliktende samtale",
    caseStudyUrl: "/kontakt",
  },
];

const comparisonData = [
  { feature: "Oppstartskostnad", custom: "200 000 - 500 000 kr", saas: "0 kr (kun månedlig leie)" },
  { feature: "Utviklingstid", custom: "6-12 måneder", saas: "1-2 uker" },
  { feature: "Månedlig kostnad", custom: "Vedlikehold: 10 000 kr+", saas: "5 000 - 10 000 kr alt inkl." },
  { feature: "Teknisk ansvar", custom: "Du må ansette utviklere", saas: "Vi håndterer alt" },
  { feature: "Oppdateringer", custom: "Ekstra kostnad", saas: "Inkludert i prisen" },
  { feature: "Sikkerhet & GDPR", custom: "Må bygges inn", saas: "Følger ISO standarder" },
  { feature: "Support", custom: "Må ordnes selv", saas: "24/7 support inkludert" },
  { feature: "Skalerbarhet", custom: "Dyrt å skalere", saas: "Ubegrenset skalerbarhet" },
];

const benefits = [
  {
    icon: Euro,
    title: "Forutsigbare kostnader",
    description: "Fast månedspris uten skjulte kostnader eller overraskelser.",
  },
  {
    icon: Zap,
    title: "Rask lansering",
    description: "I gang på 1-2 uker istedenfor måneder med utvikling.",
  },
  {
    icon: Code,
    title: "Moderne teknologi",
    description: "Bygget med Next.js, TypeScript og moderne cloud-infrastruktur.",
  },
  {
    icon: Shield,
    title: "Sikkerhet og compliance",
    description: "Følger ISO standarder med GDPR-compliance, 2FA og datakryptering.",
  },
  {
    icon: Users,
    title: "Full support",
    description: "Dedikert kundestøtte, opplæring og teknisk hjelp.",
  },
  {
    icon: TrendingUp,
    title: "Kontinuerlige forbedringer",
    description: "Nye funksjoner og oppdateringer uten ekstra kostnad.",
  },
];

const testimonials = [
  {
    company: "Svampen.no",
    quote: "Vi fikk et profesjonelt bookingsystem på 2 uker til en brøkdel av hva utvikling ville kostet. Nå kan kundene våre booke online 24/7!",
    person: "Joachim - Eier, Svampen",
    industry: "Bil- og båtpleie",
  },
  {
    company: "KKS AS",
    quote: "Vårt kurssystem håndterer tusenvis av påmeldinger årlig. ISO-sertifisert og fullt integrert med CRM og HMS.",
    person: "Kenneth - Daglig leder, KKS AS",
    industry: "Kursarrangør",
  },
];

export default function SaaSPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-primary text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-base px-4 py-2">
              💰 Spar 200 000 - 500 000 kr i utviklingskostnader
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Leie Software istedenfor å Bygge
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              Få ditt eget <strong>booking system</strong>, <strong>kurssystem (LMS)</strong>, 
              <strong> CRM</strong> eller annet skreddersydd software for kun <strong className="text-yellow-300">5 000 kr/mnd</strong>. 
              Ingen store investeringer. I gang på 1-2 uker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6" asChild>
                <Link href="#losninger">
                  Se våre løsninger
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" className="bg-primary/20 text-white border-2 border-white hover:bg-white hover:text-primary text-lg px-8 py-6" asChild>
                <Link href="#kalkulator">
                  Beregn besparelse
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Hvorfor leie istedenfor å bygge?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tradisjonell software-utvikling er dyrt, tidkrevende og komplekst. 
              Vi løser disse utfordringene.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {painPoints.map((point) => (
              <Card key={point.title} className="border-2 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <point.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-lg">{point.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{point.problem}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{point.solution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="losninger" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Våre SaaS-løsninger</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Velg en ferdig løsning eller få noe skreddersydd til din bedrift
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {solutions.map((solution) => (
              <Card key={solution.name} className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <solution.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{solution.name}</CardTitle>
                        <Badge className="mt-1 bg-green-500 text-white">
                          {solution.price}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Inkludert funksjonalitet:
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {solution.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                    <p className="text-sm font-medium mb-1">Eksempel:</p>
                    <p className="text-sm text-muted-foreground">{solution.example}</p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1" size="lg" asChild>
                      <Link href="/kontakt">
                        Kontakt oss
                        <MessageSquare className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1" size="lg" asChild>
                      <a href={solution.caseStudyUrl} target="_blank" rel="noopener noreferrer">
                        Se demo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Bygg selv vs. Leie fra oss</h2>
            <p className="text-xl text-muted-foreground">
              Se forskjellen i kostnad, tid og kompleksitet
            </p>
          </div>

          <Card className="max-w-5xl mx-auto border-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-bold">Faktor</th>
                    <th className="text-left p-4 font-bold">
                      <div className="flex items-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        Bygg selv
                      </div>
                    </th>
                    <th className="text-left p-4 font-bold">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Leie fra KKS AS
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={row.feature} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""}>
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-muted-foreground">{row.custom}</td>
                      <td className="p-4 text-green-600 dark:text-green-400 font-medium">{row.saas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="kalkulator" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-3">💰 Beregn din besparelse</CardTitle>
                <CardDescription className="text-lg">
                  Se hvor mye du sparer ved å leie istedenfor å bygge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Bygg selv */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <X className="h-5 w-5 text-red-500" />
                      Bygg selv
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Utvikling (6 mnd):</span>
                        <span className="font-bold">300 000 kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servere (årlig):</span>
                        <span className="font-bold">36 000 kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vedlikehold (årlig):</span>
                        <span className="font-bold">120 000 kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Support (årlig):</span>
                        <span className="font-bold">60 000 kr</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between text-lg">
                        <span className="font-bold">Total (2 år):</span>
                        <span className="font-bold text-red-600">732 000 kr</span>
                      </div>
                    </div>
                  </div>

                  {/* Leie fra oss */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      Leie fra KKS AS
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Oppstartkostnad:</span>
                        <span className="font-bold text-green-600">0 kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Månedlig leie:</span>
                        <span className="font-bold">5 000 kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Support inkludert:</span>
                        <span className="font-bold text-green-600">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Oppdateringer inkludert:</span>
                        <span className="font-bold text-green-600">✓</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between text-lg">
                        <span className="font-bold">Total (2 år):</span>
                        <span className="font-bold text-green-600">120 000 kr</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center bg-green-100 dark:bg-green-900/20 rounded-lg p-6">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    Du sparer: 612 000 kr på 2 år! 🎉
                  </p>
                  <p className="text-muted-foreground">
                    Pluss raskere lansering, mindre risiko og profesjonell support
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Hvorfor velge KKS AS?</h2>
            <p className="text-xl text-muted-foreground">
              Erfaring, kvalitet og dedikert support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center border-2">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Hva kundene sier</h2>
            <p className="text-xl text-muted-foreground">
              Bedrifter som allerede bruker våre løsninger
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.company} className="border-2">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <p className="text-lg italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{testimonial.person}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                        <Badge variant="outline" className="mt-1">{testimonial.industry}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Ofte stilte spørsmål</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kan jeg tilpasse systemet til min bedrift?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ja! Alle våre løsninger kan tilpasses med egen branding, logo, farger og funksjonalitet. 
                  Vi tar en behovsanalyse før oppstart.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hva er bindingstiden?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Standard bindingstid er 12 måneder. Deretter månedlig oppsigelse med 1 måneds varsel.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Får jeg tilgang til kildekoden?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ved skreddersydde løsninger over 10 000 kr/mnd kan kildekoden inkluderes mot engangsgebyr. 
                  Standardløsninger leies uten kildekode.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hva skjer med dataene mine?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All data lagres sikkert i Norge. Du eier dine egne data og kan når som helst eksportere dem. 
                  Vi følger ISO standarder og GDPR-krav.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kan jeg prøve før jeg kjøper?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ja! Vi tilbyr gratis demo og kan sette opp et test-miljø slik at du kan prøve systemet før beslutning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-2 border-primary bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Klar for å komme i gang?
              </CardTitle>
              <CardDescription className="text-lg">
                Kontakt oss i dag for en uforpliktende samtale om dine behov
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/kontakt">
                    Kontakt oss
                    <MessageSquare className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link href="/bedrift">
                    Les mer om bedriftsløsninger
                  </Link>
                </Button>
              </div>
              <div className="text-center space-y-2 text-sm text-muted-foreground">
                <p>📧 E-post: post@kksas.no</p>
                <p>📞 Software-salg: +47 99 11 29 16</p>
                <p>💬 Svar innen 24 timer</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

