import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { BedriftKontaktForm } from "./form";
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
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Skreddersydde kurs",
    description: "Tilpass kursinnholdet til deres spesifikke behov og bransje",
  },
  {
    icon: Building2,
    title: "På deres lokasjon",
    description: "Vi kommer til dere - spar tid og reisekostnader for deres ansatte",
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
    description: "Vi setter opp kurs raskt - ofte innen få dager",
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
  {
    title: "Truckkurs",
    description: "Opplæring i sikker bruk av truck",
    duration: "2-3 dager",
  },
  {
    title: "Krankurs",
    description: "Sertifisering for kranføring",
    duration: "3-5 dager",
  },
  {
    title: "Stillaskurs",
    description: "Sikker montering og bruk av stillas",
    duration: "1-2 dager",
  },
  {
    title: "HMS-kurs",
    description: "Helse, miljø og sikkerhet på arbeidsplassen",
    duration: "1 dag",
  },
  {
    title: "Verne- og sikkerhetsutstyr",
    description: "Korrekt bruk av personlig verneutstyr",
    duration: "1/2 dag",
  },
  {
    title: "Førstehjelp",
    description: "Grunnleggende førstehjelp på arbeidsplassen",
    duration: "1 dag",
  },
];

const steps = [
  {
    number: "1",
    title: "Ta kontakt",
    description: "Fyll ut skjemaet eller ring oss direkte",
  },
  {
    number: "2",
    title: "Kartlegging",
    description: "Vi kartlegger deres behov og lager et tilpasset tilbud",
  },
  {
    number: "3",
    title: "Planlegging",
    description: "Vi blir enige om tid, sted og innhold",
  },
  {
    number: "4",
    title: "Gjennomføring",
    description: "Vi holder kurset hos dere eller på vårt kurssenter",
  },
  {
    number: "5",
    title: "Oppfølging",
    description: "Digitale kursbevis og oppfølging i vårt system",
  },
];

export default function BedriftPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Kursløsninger for bedrifter
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sikre at deres ansatte har nødvendig kompetanse og sertifiseringer.
              Vi tilbyr skreddersydde kursløsninger for små og store bedrifter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#kontakt">
                <Button size="lg" className="w-full sm:w-auto">
                  Be om tilbud
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Link href="/kurs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Se alle kurs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Hvorfor velge oss?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vi gjør det enkelt for bedrifter å sikre at ansatte har riktig kompetanse
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Populære kurs */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Populære kurs for bedrifter
            </h2>
            <p className="text-muted-foreground">
              Vi tilbyr et bredt spekter av kurs innen HMS, sikkerhet og kompetanse
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {courses.map((course) => (
              <Card key={course.title}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Varighet: {course.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Slik fungerer det */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Slik fungerer det
            </h2>
            <p className="text-muted-foreground">
              Enkelt og oversiktlig prosess fra forespørsel til gjennomføring
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 mt-12 w-0.5 h-8 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kontaktskjema */}
      <section id="kontakt" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Be om tilbud
              </h2>
              <p className="text-muted-foreground">
                Fyll ut skjemaet så tar vi kontakt med deg for en uforpliktende samtale
              </p>
            </div>
            <Card className="border-2">
              <CardContent className="pt-6">
                <BedriftKontaktForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Klar til å komme i gang?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Kontakt oss i dag for et uforpliktende tilbud på kurs for deres bedrift
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#kontakt">
              <Button size="lg" variant="secondary">
                Be om tilbud
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/bht-medlem">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
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

