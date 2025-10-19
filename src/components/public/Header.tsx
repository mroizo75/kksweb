import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
          <Image src="/logo-black-kks.png" alt="KKS AS" width={150} height={150} />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/kurs" className="text-sm hover:text-primary transition-colors">
            Alle kurs
          </Link>
          <Link href="/bht-medlem" className="text-sm hover:text-primary transition-colors">
            BHT-medlem
          </Link>
          <Link href="/portefolje" className="text-sm hover:text-primary transition-colors">
            Våre Produkter
          </Link>
          <Link href="/om-oss" className="text-sm hover:text-primary transition-colors">
            Om oss
          </Link>
          <Link href="/kontakt" className="text-sm hover:text-primary transition-colors">
            Kontakt
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
        </nav>
        {/* Mobile menu - TODO: Implement hamburger menu */}
        <div className="md:hidden">
          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              Logg inn
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

