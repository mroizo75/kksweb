"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image src="/logo-black-kks.png" alt="KKS AS" width={200} height={200} className="h-12 md:h-16 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/kurs" className="text-sm hover:text-primary transition-colors">
            Alle kurs
          </Link>
          <Link href="/bht-medlem" className="text-sm hover:text-primary transition-colors">
            BHT-medlem
          </Link>
          <Link href="/bedrift" className="text-sm hover:text-primary transition-colors">
            For bedrifter
          </Link>
          <Link href="/saas" className="text-sm hover:text-primary transition-colors font-semibold">
            Leie Software
          </Link>
          <Link href="/portefolje" className="text-sm hover:text-primary transition-colors">
            Våre Produkter
          </Link>
          <Link href="/blogg" className="text-sm hover:text-primary transition-colors">
            Blogg
          </Link>
          <Link href="/om-oss" className="text-sm hover:text-primary transition-colors">
            Om oss
          </Link>
          <Link href="/kontakt" className="text-sm hover:text-primary transition-colors">
            Kontakt
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Lukk meny" : "Åpne meny"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link 
              href="/kurs" 
              className="text-sm hover:text-primary transition-colors py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Alle kurs
            </Link>
            <Link 
              href="/bht-medlem" 
              className="text-sm hover:text-primary transition-colors py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BHT-medlem
            </Link>
            <Link 
              href="/bedrift" 
              className="text-sm hover:text-primary transition-colors py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For bedrifter
            </Link>
            <Link 
              href="/saas" 
              className="text-sm hover:text-primary transition-colors py-2 border-b font-semibold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Leie Software
            </Link>
            <Link 
              href="/portefolje" 
              className="text-sm hover:text-primary transition-colors py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Våre Produkter
            </Link>
            <Link 
              href="/blogg" 
              className="text-sm hover:text-primary transition-colors py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blogg
            </Link>
            <Link 
              href="/om-oss" 
              className="text-sm hover:text-primary transition-colors py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Om oss
            </Link>
            <Link 
              href="/kontakt" 
              className="text-sm hover:text-primary transition-colors py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Kontakt
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
