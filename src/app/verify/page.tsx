import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Search, 
  CheckCircle,
  Info,
  AlertCircle,
  QrCode,
} from "lucide-react";

export const metadata = {
  title: "Verifiser Kompetansebevis - KKS AS",
  description: "Verifiser gyldigheten av kompetansebevis utstedt av KKS AS",
};

export default function VerifyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-blue-700 to-primary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ShieldCheck className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Verifiser Kompetansebevis
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Sjekk gyldigheten av kompetansebevis utstedt av KKS
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Search className="h-6 w-6 text-primary" />
                  Søk etter kompetansebevis
                </CardTitle>
                <CardDescription>
                  Skriv inn verifikasjonskoden fra kompetansebeviset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action="/verify" method="GET" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verifikasjonskode</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="code" 
                        name="code" 
                        placeholder="Eks: ABC123XYZ456"
                        className="flex-1"
                        required
                      />
                      <Button type="submit" size="lg">
                        <Search className="h-4 w-4 mr-2" />
                        Verifiser
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Verifikasjonskoden finner du på kompetansebeviset, vanligvis nederst eller i QR-koden.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Hvordan verifisere?</h2>
              <p className="text-xl text-muted-foreground">
                Tre enkle måter å sjekke gyldigheten
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-center">1. Søk med kode</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  <p>
                    Skriv inn verifikasjonskoden fra kompetansebeviset i søkefeltet ovenfor
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <QrCode className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-center">2. Skann QR-kode</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  <p>
                    Skann QR-koden på kompetansebeviset med mobilkamera eller QR-scanner
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-center">3. Se resultatet</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  <p>
                    Få umiddelbar bekreftelse på om kompetansebeviset er gyldig og se detaljene
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What to check */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Info className="h-6 w-6 text-primary" />
                  Hva viser verifiseringen?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Personinformasjon:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Navn på kursdeltaker</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Fødselsdato (delvis skjult)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Profilbilde (hvis tilgjengelig)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Kursinformasjon:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Kursnavn og kurskode</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Gjennomføringsdato</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Gyldig fra og til dato</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Status (gyldig/utgått)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Info */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  Sikkerhet og personvern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Alle kompetansebevis fra KKS AS er utstyrt med en unik verifikasjonskode som 
                  ikke kan forfalskes. Ved verifisering vises kun nødvendig informasjon for å 
                  bekrefte gyldigheten.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Kryptert</h4>
                      <p className="text-sm">Alle data er kryptert med SSL/TLS</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">GDPR</h4>
                      <p className="text-sm">Følger personvernregelverket</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">ISO 27001</h4>
                      <p className="text-sm">Sertifisert informasjonssikkerhet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Audit Trail</h4>
                      <p className="text-sm">All verifisering logges</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Ofte stilte spørsmål</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hvor finner jeg verifikasjonskoden?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Verifikasjonskoden er trykt på kompetansebeviset, vanligvis nederst på siden. 
                    Den er også innebygd i QR-koden som du kan skanne.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hva betyr det hvis beviset er utgått?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Mange typer kompetansebevis har en begrenset gyldighetsperiode (f.eks. 2-5 år). 
                    Hvis beviset er utgått, må deltakeren ta kurset på nytt for å fornye kompetansen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kan jeg verifisere midlertidige bevis?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Ja, midlertidige kompetansebevis kan også verifiseres. Disse har vanligvis en 
                    gyldighet på 14 dager og erstattes av det permanente beviset.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hva gjør jeg hvis koden ikke fungerer?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Sjekk at du har skrevet inn koden korrekt (store/små bokstaver). Hvis problemet 
                    vedvarer, kontakt oss på post@kksas.no eller telefon +47 99 11 29 16.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-2 border-primary">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle className="text-2xl">Trenger du hjelp?</CardTitle>
              <CardDescription className="text-base">
                Kontakt oss hvis du har spørsmål om verifisering av kompetansebevis
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="mailto:post@kksas.no">Send e-post</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="tel:+4799112916">Ring oss</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

