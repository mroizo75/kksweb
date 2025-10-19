import Link from "next/link";
import Image from "next/image";
export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image src="/logo-black-kks.png" alt="KKS AS" width={150} height={150} />
            <p className="text-sm text-muted-foreground">
              Kurs og Kompetansesystemer AS - Profesjonell kursvirksomhet med fokus på kvalitet og sikkerhet.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Tjenester</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/kurs" className="text-muted-foreground hover:text-foreground transition-colors">
                Kurs
              </Link>
              <Link href="/bedrift" className="text-muted-foreground hover:text-foreground transition-colors">
                For bedrifter
              </Link>
              <Link href="/bht-medlem" className="text-muted-foreground hover:text-foreground transition-colors">
                BHT-medlemskap
              </Link>
              <Link href="/portefolje" className="text-muted-foreground hover:text-foreground transition-colors">
                Våre produkter
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4">Kontakt</h3>
            <p className="text-sm text-muted-foreground">
              Telefon: +47 99 11 29 16
              <br />
              E-post: post@kksas.no
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Informasjon</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/om-oss" className="text-muted-foreground hover:text-foreground transition-colors">
                Om oss
              </Link>
              <Link href="/personvern" className="text-muted-foreground hover:text-foreground transition-colors">
                Personvern
              </Link>
              <Link href="/vilkar" className="text-muted-foreground hover:text-foreground transition-colors">
                Vilkår
              </Link>
              <Link href="/klage" className="text-muted-foreground hover:text-foreground transition-colors">
                Klage/tilbakemelding
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KKS Kurs & HMS. Alle rettigheter reservert.
        </div>
      </div>
    </footer>
  );
}

