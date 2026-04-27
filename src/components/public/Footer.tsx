import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

const tjenester = [
  { label: "Alle kurs", href: "/kurs" },
  { label: "For bedrifter", href: "/bedrift" },
  { label: "Arbeid i høyden", href: "/arbeid-i-hoyden" },
  { label: "BHT-medlemskap", href: "/bht-medlem" },
  { label: "Våre produkter", href: "/portefolje" },
  { label: "Blogg", href: "/blogg" },
];

const lokasjoner = [
  { label: "Kurs i Oslo", href: "/lokasjon/oslo" },
  { label: "Kurs i Bergen", href: "/lokasjon/bergen" },
  { label: "Kurs i Trondheim", href: "/lokasjon/trondheim" },
  { label: "Kurs i Stavanger", href: "/lokasjon/stavanger" },
  { label: "Kurs i Kristiansand", href: "/lokasjon/kristiansand" },
  { label: "Kurs i Tromsø", href: "/lokasjon/tromso" },
];

const informasjon = [
  { label: "Om oss", href: "/om-oss" },
  { label: "Bli instruktør", href: "/bli-instruktor" },
  { label: "Personvern", href: "/personvern" },
  { label: "Vilkår", href: "/vilkar" },
  { label: "Klage / tilbakemelding", href: "/klage" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="container mx-auto px-4 pt-14 pb-8">

        {/* Hoveddel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">

          {/* Kolonne 1: Logo + info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-5 hover:opacity-75 transition-opacity">
              <Image
                src="/logo-black-kks.png"
                alt="KKS AS"
                width={300}
                height={150}
                className="h-24 w-auto"
              />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              Kurs og Kompetansesystemer AS — profesjonell kursvirksomhet med
              fokus på kvalitet og sikkerhet i hele Norge.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  Frøbergvegen 71, 2320 Furnes
                  <br />
                  Org.nr: 925 897 019
                </span>
              </div>
              <a
                href="tel:+4791540824"
                className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-amber-600 transition-colors"
              >
                <Phone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span>+47 91 54 08 24</span>
              </a>
              <a
                href="mailto:post@kksas.no"
                className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-amber-600 transition-colors"
              >
                <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span>post@kksas.no</span>
              </a>
            </div>
          </div>

          {/* Kolonne 2: Tjenester */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
              Tjenester
            </h3>
            <ul className="space-y-2.5">
              {tjenester.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolonne 3: Lokasjoner */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
              Lokasjoner
            </h3>
            <ul className="space-y-2.5">
              {lokasjoner.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolonne 4: Informasjon */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
              Informasjon
            </h3>
            <ul className="space-y-2.5">
              {informasjon.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bunndel */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 order-2 sm:order-1">
            © {new Date().getFullYear()} KKS AS — Kurs og Kompetansesystemer AS.
            Alle rettigheter reservert.
          </p>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <Link
              href="/personvern"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Personvern
            </Link>
            <span className="text-slate-300">·</span>
            <Link
              href="/vilkar"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Vilkår
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
