import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import {
  ExternalLink,
  Zap,
  ShieldCheck,
  Calendar,
  Globe,
  Car,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata = {
  title: "Våre produkter — KKS AS",
  description:
    "KKS AS og tilknyttede softwareproduktene våre: HMS Nova, Bransjekurs.no, Arrango.no, Svampen.no og Scrut-Man. Innovative løsninger for norske bedrifter.",
  alternates: {
    canonical: `${BASE_URL}/portefolje`,
  },
};

const products = [
  {
    name: "KKS AS",
    tagline: "Kurs og Kompetansesystemer",
    description:
      "Komplett plattform for kursstyring, HMS og kompetansedokumentasjon. Sertifisert opplæringsvirksomhet godkjent av Norsk Sertifisering.",
    url: "https://www.kksas.no",
    icon: ShieldCheck,
    status: "Live",
    features: [
      "Kursstyring og påmelding",
      "Digitale kompetansebevis",
      "CRM og automatisering",
      "2FA og GDPR compliance",
    ],
  },
  {
    name: "Bransjekurs.no",
    tagline: "Kurskatalog for Norge",
    description:
      "Plattform for bransjekurs og fagopplæring med sømløs integrasjon mot KKS. Forenkler kursadministrasjon for arrangører og deltakere.",
    url: "https://bransjekurs.no",
    icon: Calendar,
    status: "Under utvikling",
    features: [
      "Bred kurskatalog",
      "Webhook-integrasjon",
      "Automatisk synkronisering",
      "Bedriftsløsninger",
    ],
  },
  {
    name: "HMS Nova",
    tagline: "Digitalt HMS-system",
    description:
      "Avansert HMS-system for moderne bedrifter. Håndter avvik, risiko, dokumenter og KPI på ett sted — fra 300 kr/mnd.",
    url: "https://hmsnova.com",
    icon: ShieldCheck,
    status: "Live",
    features: [
      "Avvikshåndtering",
      "Risikovurdering",
      "Dokumenthåndtering",
      "KPI og målstyring",
    ],
  },
  {
    name: "Arrango.no",
    tagline: "Billett- og arrangementplatform",
    description:
      "Ticket marketplace for det norske markedet. Sømløs billetthandel og eventadministrasjon for arrangører i alle størrelser.",
    url: "https://www.arrango.no",
    icon: Globe,
    status: "Live",
    features: [
      "Billettsalg og booking",
      "Event management",
      "Stripe og Klarna",
      "Salgsrapportering",
    ],
  },
  {
    name: "Svampen.no",
    tagline: "Bil- og båtpleie",
    description:
      "Profesjonell bil- og båtpleie med over 10 års erfaring. Komplett bookingsystem for vaskerier og bilpleie.",
    url: "https://www.svampen.no",
    icon: Car,
    status: "Live",
    features: [
      "Online booking 24/7",
      "Pakkeadministrasjon",
      "Kundeadministrasjon",
      "SMS og e-post varsling",
    ],
  },
  {
    name: "Scrut-Man.com",
    tagline: "Motorsport-administrasjon",
    description:
      "Komplett påmeldingssystem for motorsporten. Håndterer alt fra innsjekk og teknisk kontroll til startlister.",
    url: "https://scrut-man.com",
    icon: Zap,
    status: "Under utvikling",
    features: [
      "Digital innsjekk",
      "Teknisk kontroll",
      "Startliste-generering",
      "Federation management",
    ],
  },
  {
    name: "Kommende prosjekter",
    tagline: "Alltid i utvikling",
    description:
      "Vi jobber kontinuerlig med nye innovative løsninger. Hold øye med denne siden for oppdateringer.",
    url: null,
    icon: Sparkles,
    status: "Kommer snart",
    features: [
      "AI-drevne løsninger",
      "Automatisering",
      "Integrasjonsplattform",
      "Og mye mer...",
    ],
  },
];

const statusStyle: Record<string, string> = {
  Live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Under utvikling": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Kommer snart": "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export default function PortefoliePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2" aria-label="Brødsmulesti">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">Våre produkter</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-amber-400/20 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-widest">
              <Globe className="h-3.5 w-3.5" />
              Programvareøkosystem
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Våre produkter
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              KKS AS utvikler og drifter et økosystem av softwareløsninger for norske bedrifter —
              fra kursstyring og HMS til billettsalg og motorsport.
            </p>
          </div>
        </div>
      </section>

      {/* Produktgrid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.name}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 transition-all"
                >
                  {/* Korthodet */}
                  <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-amber-400" />
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle[product.status]}`}
                      >
                        {product.status}
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 text-lg leading-tight">
                      {product.name}
                    </h2>
                    <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mt-0.5">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Kortinnhold */}
                  <div className="px-6 py-5 flex-1 flex flex-col gap-5">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {product.description}
                    </p>

                    <ul className="space-y-2">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {product.url ? (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors"
                      >
                        Besøk {product.name}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="mt-auto text-sm text-slate-400 italic">
                        Kommer snart
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrasjon-seksjon */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-amber-400/20 rounded-full text-amber-700 text-xs font-semibold">
                <Zap className="h-3.5 w-3.5" />
                Sømløs integrasjon
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Produktene jobber sammen
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Alle løsningene er designet for å dele data via API-er og webhooks —
                slik at du slipper dobbeltarbeid og manuelle overføringer.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: Globe, title: "REST API", desc: "Moderne og dokumenterte API-er for alle produkter" },
                { icon: Zap, title: "Webhooks", desc: "Sanntids oppdateringer mellom systemer" },
                { icon: ShieldCheck, title: "Sikkerhet", desc: "OAuth 2.0, kryptering og GDPR-compliance" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center"
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Interessert i våre løsninger?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Ta kontakt for å lære mer om hvordan produktene kan hjelpe din bedrift.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/kontakt">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 h-12">
                Kontakt oss
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/bedrift">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 px-8 h-12"
              >
                Bedriftsløsninger
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
