import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Building2,
  Facebook,
  Linkedin,
  ChevronRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata = {
  title: "Kontakt KKS AS — Spørsmål om truckkurs, HMS og bedriftsopplæring",
  description:
    "Ring oss på +47 91 54 08 24 eller send e-post til post@kksas.no. Vi hjelper deg med truckkurs, krankurs, HMS og bedriftsavtaler. Åpent Man–Fre 08:00–16:00.",
  alternates: {
    canonical: `${BASE_URL}/kontakt`,
  },
};

const contactCards = [
  {
    icon: Mail,
    title: "E-post",
    value: "post@kksas.no",
    href: "mailto:post@kksas.no",
  },
  {
    icon: Phone,
    title: "Telefon kurs",
    value: "+47 91 54 08 24",
    href: "tel:+4791540824",
  },
  {
    icon: Phone,
    title: "Telefon software",
    value: "+47 99 11 29 16",
    href: "tel:+4799112916",
  },
  {
    icon: Clock,
    title: "Åpningstider",
    value: "Man–Fre: 08:00–16:00",
    href: null,
  },
];

const topics = [
  {
    icon: MessageSquare,
    title: "Generelle henvendelser",
    description: "Spørsmål om kurs, påmelding eller informasjon",
  },
  {
    icon: Building2,
    title: "Bedriftsløsninger",
    description: "Skreddersydde kurs for din bedrift",
  },
  {
    icon: Phone,
    title: "Support",
    description: "Hjelp med påmelding eller tekniske spørsmål",
  },
];

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">Kontakt</span>
          </nav>
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Kontakt oss
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Vi er her for deg
            </h1>
            <p className="text-lg text-slate-300">
              Ta kontakt for spørsmål om kurs, bedriftsavtaler eller samarbeid.
            </p>
          </div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {contactCards.map((info) => (
              <div key={info.title} className="bg-white rounded-2xl border border-slate-200 p-5 text-center hover:border-amber-300 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <info.icon className="h-5 w-5 text-amber-600" />
                </div>
                <p className="font-semibold text-slate-900 text-sm mb-1">{info.title}</p>
                {info.href ? (
                  <a
                    href={info.href}
                    className="text-sm text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">{info.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + topics */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact form */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send oss en melding</h2>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <ContactForm />
              </div>
            </div>

            {/* Topics + links + social */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-5">Hva kan vi hjelpe med?</h2>
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <div key={topic.title} className="flex items-start gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <topic.icon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{topic.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{topic.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-3">Nyttige lenker</h3>
                <div className="space-y-2">
                  {[
                    { href: "/kurs", label: "Se alle kurs" },
                    { href: "/bedrift", label: "Kurs for bedrifter" },
                    { href: "/bht-medlem", label: "BHT-medlemskap" },
                    { href: "/om-oss", label: "Om oss" },
                  ].map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-amber-200 transition-all text-sm text-slate-600 hover:text-amber-700">
                        <span>{link.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="bg-slate-950 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-1">Følg oss på sosiale medier</h3>
                <p className="text-slate-400 text-xs mb-4">Hold deg oppdatert med siste nytt fra KKS AS</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1 border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-400" asChild>
                    <a href="https://www.facebook.com/kursogkompetansesystemer" target="_blank" rel="noopener noreferrer">
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-400" asChild>
                    <a href="https://www.linkedin.com/company/kurs-og-kompetansesystemer-as/" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
