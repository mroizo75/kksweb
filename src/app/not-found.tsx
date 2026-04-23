import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <SearchX className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Beklager, vi finner ikke siden du leter etter. Den kan ha blitt
            flyttet eller fjernet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg">Gå til forsiden</Button>
            </Link>
            <Link href="/kurs">
              <Button size="lg" variant="outline">
                Se alle kurs
              </Button>
            </Link>
            <Link href="/kontakt">
              <Button size="lg" variant="outline">
                Kontakt oss
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
