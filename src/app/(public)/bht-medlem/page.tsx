import { Metadata } from "next";
import { BhtMembershipForm } from "@/components/public/BhtMembershipForm";
import { BhtChecker } from "@/components/public/BhtChecker";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import {
  Check,
  Heart,
  Shield,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Info,
  AlertTriangle,
  BookOpen,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "BHT-medlem og HMS-system | KKS AS",
  description:
    "Alle virksomheter med lovpålagt BHT trenger også et HMS-system. Få begge deler gjennom KKS: BHT via Dr Dropin med 10% rabatt og HMS Nova for 300 kr/mnd.",
  alternates: {
    canonical: `${BASE_URL}/bht-medlem`,
  },
};

const features = [
  {
    icon: Stethoscope,
    title: "BHT via Dr Dropin",
    description:
      "Godkjent bedriftshelsetjeneste for dine ansatte med 10% rabatt. Helseundersøkelser, legetimer, vaksinering og risikovurdering.",
    color: "text-rose-500",
    bg: "bg-rose-50",
    badge: "Lovpålagt",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  {
    icon: Shield,
    title: "HMS Nova",
    description:
      "Digitalt HMS-system for kun 300 kr/mnd. Internkontroll, avvikshåndtering, RUH og all dokumentasjon som Arbeidstilsynet krever.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "Lovpålagt",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: TrendingUp,
    title: "Automatisk oppfølging",
    description:
      "Vi følger opp dine ansatte med påminnelser om fornyelser, helseundersøkelser og kursing — slik at du alltid er à jour.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    badge: "Inkludert",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

const includes = [
  { title: "10% rabatt på BHT", sub: "Alle tjenester via Dr Dropin" },
  { title: "HMS Nova (300 kr/mnd)", sub: "Godkjent digitalt HMS-system" },
  { title: "Bedre kursrabatter", sub: "Kurs innen arbeidsutstyr og maskiner" },
  { title: "Dedikert kontaktperson", sub: "Din HMS-rådgiver hos KKS" },
  { title: "Automatisk varsling", sub: "Vi holder orden på frister" },
  { title: "Support når du trenger det", sub: "E-post og telefon" },
];

export default function BhtMemberPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Hjem
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">BHT og HMS</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-amber-400/20 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-widest">
              <Heart className="h-3.5 w-3.5" />
              Fullverdig HMS-løsning
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              BHT og HMS — begge er lovpålagt
            </h1>
            <p className="text-lg text-slate-300 mb-4 max-w-2xl">
              Mange tror man kan velge enten BHT <em>eller</em> HMS-system. Det stemmer ikke.
              Arbeidsmiljøloven krever begge deler: en{" "}
              <strong className="text-white">godkjent bedriftshelsetjeneste (BHT)</strong> og et{" "}
              <strong className="text-white">fungerende HMS-system</strong> med internkontroll.
            </p>
            <p className="text-slate-400 mb-8 max-w-2xl">
              Gjennom KKS får du begge i én pakke: BHT via Dr Dropin med{" "}
              <strong className="text-amber-400">10% rabatt</strong> og HMS Nova for kun{" "}
              <strong className="text-amber-400">300 kr/mnd</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#pamelding">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8">
                  Bli medlem
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#sjekk">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 px-8"
                >
                  Sjekk om dere er pålagt
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Law explanation */}
      <section className="bg-amber-50 border-b border-amber-200 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h2 className="font-bold text-amber-900 mb-2">
                  Hva sier loven? — Arbeidsmiljøloven § 3-3 og Internkontrollforskriften
                </h2>
                <div className="grid sm:grid-cols-2 gap-6 text-sm text-amber-800">
                  <div>
                    <p className="font-semibold mb-1">Bedriftshelsetjeneste (BHT)</p>
                    <p className="leading-relaxed">
                      Arbeidsgiver i spesifiserte bransjer er lovpålagt å knytte seg til en godkjent
                      BHT. BHT-en skal bistå med kartlegging av arbeidsmiljøet, helseundersøkelser
                      og forebyggende arbeid. Det er ikke tilstrekkelig å bare ha et HMS-system.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">HMS-system (internkontroll)</p>
                    <p className="leading-relaxed">
                      Alle virksomheter med ansatte er pålagt systematisk HMS-arbeid etter
                      Internkontrollforskriften (IK-HMS). Dette innebærer skriftlige prosedyrer,
                      avvikshåndtering og risikovurdering — uavhengig av om dere også er pålagt BHT.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Kilde: Arbeidsmiljøloven § 3-3 og Forskrift om organisering, ledelse og medvirkning
                  kapittel 13 (sist oppdatert 7. oktober 2025)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Hva får du gjennom KKS?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Vi samler alt på ett sted, slik at dere møter både BHT-plikten og HMS-kravene i én enkel
              avtale.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center`}
                    >
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.badgeColor}`}>
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BHT Checker */}
      <section id="sjekk" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-slate-100 rounded-full text-slate-600 text-xs font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Sjekk din bedrift
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Er dere pålagt BHT?</h2>
              <p className="text-slate-500">
                Skriv inn organisasjonsnummeret til bedriften, så sjekker vi mot næringskodene i
                Arbeidstilsynets liste over lovpålagte bransjer — direkte fra Brønnøysundregistrene.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
              <BhtChecker />
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Hva inngår i medlemskapet?
            </h2>
            <div className="bg-slate-950 rounded-2xl p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {includes.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-slate-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign-up form */}
      <section id="pamelding" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Kom i gang i dag</h2>
              <p className="text-slate-500">
                Fyll ut skjemaet under så kontakter vi deg innen 24 timer med et komplett tilbud
                for BHT og HMS.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <BhtMembershipForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
