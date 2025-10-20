import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductLogo } from "@/components/portefolje/ProductLogo";
import { 
  ExternalLink,
  Code,
  Zap,
  ShieldCheck,
  Users,
  Calendar,
  CheckSquare,
  Globe,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Våre Produkter - KKS AS",
  description: "Utforsk vårt økosystem av innovative softwareløsninger for kurs, HMS, billettsalg, motorsport og mer",
};

const products = [
  {
    name: "KKS AS",
    description: "Kurs og Kompetansesystemer AS - Komplett plattform for kursstyring, HMS og kompetansesystemer. ISO 9001 og ISO 27001 sertifisert.",
    url: "https://www.kksas.no",
    iconName: "ShieldCheck",
    logo: "/logos/kks-logo.png",
    status: "Live",
    statusColor: "bg-green-500",
    features: [
      "Kursstyring og påmelding",
      "ISO 9001 kvalitetssystem",
      "ISO 27001 informasjonssikkerhet",
      "2FA og GDPR compliance",
      "CRM og automatisering",
      "Digitale kompetansebevis",
    ],
    tech: ["Next.js 15", "Prisma", "MySQL", "TypeScript", "Tailwind CSS"],
  },
  {
    name: "Bransjekurs.no",
    description: "Norges ledende plattform for bransjekurs og fagopplæring. Sømløs integrasjon med KKS.",
    url: "https://bransjekurs.no",
    iconName: "Calendar",
    logo: "/logos/bransjekurs-logo.png",
    status: "Under utvikling",
    statusColor: "bg-orange-500",
    features: [
      "Omfattende kurskatalog",
      "Webhook-integrasjon",
      "Automatisk synkronisering",
      "Sanntids oppdateringer",
      "Bedriftsløsninger",
      "Rapportering og analyse",
    ],
    tech: ["Next.js", "API Integration", "Real-time Sync"],
  },
  {
    name: "HMS Nova",
    description: "Avansert HMS-system for moderne bedrifter. Håndter avvik, risiko, dokumenter og KPI på ett sted.",
    url: "https://hmsnova.com",
    iconName: "CheckSquare",
    logo: "/logos/hmsnova-logo.png",
    status: "Live",
    statusColor: "bg-green-500",
    features: [
      "Avvikshåndtering",
      "Risikovurdering",
      "Dokumenthåndtering",
      "KPI og målstyring",
      "Automatiske varslinger",
      "Mobile løsninger",
    ],
    tech: ["React", "Node.js", "Cloud Infrastructure"],
  },
  {
    name: "Arrango.no",
    description: "Ticket marketplace for det norske markedet. Plattform for moderne arrangører - oppdag arrangementer, kjøp billetter og administrer events.",
    url: "https://www.arrango.no",
    iconName: "Globe",
    logo: "/logos/arrango-logo.png",
    status: "Live",
    statusColor: "bg-green-500",
    features: [
      "Billettsalg og booking",
      "Event management",
      "Kundehåndtering",
      "Salgsrapportering",
      "Marketing tools",
      "Sikre betalingsmetoder",
    ],
    tech: ["Next.js", "Stripe", "Klarna", "TypeScript"],
  },
  {
    name: "TaskGuild.com",
    description: "Plattform for servicebedrifter som vil tilby medlemskap og booke tjenester. Fleksibel løsning som passer mange forskjellige bedrifter.",
    url: "https://taskguild.com",
    iconName: "Users",
    logo: "/logos/taskguild-logo.png",
    status: "Live",
    statusColor: "bg-green-500",
    features: [
      "Medlemskapsstyring",
      "Booking av tjenester",
      "Kalenderintegrasjon",
      "Kundeadministrasjon",
      "Betalingsløsninger",
      "Rapporter og insights",
    ],
    tech: ["React", "Node.js", "PostgreSQL"],
  },
  {
    name: "Scrut-Man.com",
    description: "Komplett påmeldingssystem for motorsporten. Håndterer alt fra innsjekk og teknisk kontroll til startlister. Federation-løsning for organisasjoner og utøvere med full kontroll over egen data.",
    url: "https://scrut-man.com",
    iconName: "Zap",
    logo: "/logos/scrutman-logo.png",
    status: "Under utvikling",
    statusColor: "bg-orange-500",
    features: [
      "Digital innsjekk",
      "Teknisk kontroll",
      "Startliste-generering",
      "Federation management",
      "Utøver-administrasjon",
      "Digital databehandling",
    ],
    tech: ["Vue.js", "Firebase", "Real-time Updates"],
  },
  {
    name: "Kommende prosjekter",
    description: "Vi jobber kontinuerlig med nye innovative løsninger. Hold øye med denne siden for oppdateringer!",
    url: "#",
    iconName: "Sparkles",
    status: "Kommer snart",
    statusColor: "bg-yellow-500",
    features: [
      "AI-drevne løsninger",
      "Automatisering",
      "Integrasjonsplattform",
      "Og mye mer...",
    ],
    tech: ["Next.js", "AI/ML", "Cloud"],
  },
];

const stats = [
  { value: "7", label: "Produkter" },
  { value: "5000+", label: "Aktive brukere" },
  { value: "99.9%", label: "Oppetid" },
  { value: "24/7", label: "Support" },
];

export default function PortefoliePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-700 to-primary text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Code className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Vårt Software Økosystem
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Innovative løsninger for kurs, HMS, prosjektstyring og mer. 
              Bygget med moderne teknologi for maksimal effektivitet.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Products Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Våre Produkter</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Et økosystem av integrerte løsninger designet for å effektivisere 
              din bedrifts arbeidsprosesser
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {products.map((product) => (
              <Card key={product.name} className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-start justify-between">
                      <ProductLogo 
                        logo={product.logo} 
                        name={product.name} 
                        iconName={product.iconName} 
                      />
                      <Badge 
                        className={`${product.statusColor} text-white`}
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">{product.name}</CardTitle>
                      <CardDescription className="text-base">
                        {product.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3">Hovedfunksjoner:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h4 className="font-semibold mb-3">Teknologi:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tech.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  {product.url !== "#" && (
                    <Button 
                      asChild 
                      className="w-full"
                      size="lg"
                    >
                      <a 
                        href={product.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Besøk {product.name}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Zap className="h-16 w-16 mx-auto text-primary mb-6" />
            <h2 className="text-4xl font-bold mb-6">Sømløs integrasjon</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Alle våre produkter er designet for å fungere sammen. Webhook-integrasjoner, 
              API-er og automatiske synkroniseringer sørger for at data flyter fritt mellom 
              systemene.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">REST API</h3>
                  <p className="text-sm text-muted-foreground">
                    Moderne og dokumenterte API-er
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Webhooks</h3>
                  <p className="text-sm text-muted-foreground">
                    Sanntids oppdateringer
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Sikkerhet</h3>
                  <p className="text-sm text-muted-foreground">
                    OAuth 2.0 og kryptering
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-2 border-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-3">Interessert i våre løsninger?</CardTitle>
              <CardDescription className="text-lg">
                Ta kontakt for å lære mer om hvordan våre produkter kan hjelpe din bedrift
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/kontakt">Kontakt oss</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/bedrift">Bedriftsløsninger</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

