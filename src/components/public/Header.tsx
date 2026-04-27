"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X, ArrowRight, LogIn } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Kurs", href: "/kurs" },
  { label: "For bedrifter", href: "/bedrift" },
  { label: "BHT-medlem", href: "/bht-medlem" },
  { label: "Våre produkter", href: "/portefolje" },
  { label: "Blogg", href: "/blogg" },
  { label: "Om oss", href: "/om-oss" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src="/logo-white-kks.png"
              alt="KKS AS"
              width={200}
              height={85}
              className="h-20 md:h-24 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg group"
              >
                {link.label}
                <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop: kontakt + logg inn + CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/kontakt">
              <span className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2">
                Kontakt
              </span>
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors px-3 py-2"
              title="Logg inn"
            >
              <LogIn className="h-4 w-4" />
              Logg inn
            </Link>
            <Link href="/kurs">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg h-9 px-4 text-sm shadow-sm shadow-amber-500/20">
                Meld deg på
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobil: CTA + hamburgermeny */}
          <div className="flex lg:hidden items-center gap-2">
            <Link href="/kurs">
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg h-8 px-3 text-xs"
              >
                Meld deg på
              </Button>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Lukk meny" : "Åpne meny"}
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobilmeny */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900">
          <nav className="container mx-auto px-4 py-2 flex flex-col">
            {[...navLinks, { label: "Kontakt", href: "/kontakt" }, { label: "Logg inn", href: "/admin/login" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-3.5 text-sm font-medium text-slate-300 hover:text-amber-400 border-b border-slate-800 last:border-0 transition-colors"
              >
                {link.label}
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
