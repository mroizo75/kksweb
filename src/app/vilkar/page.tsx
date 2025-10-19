import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  CreditCard,
  RefreshCw,
  Shield,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Vilkår og betingelser - KKS AS",
  description: "Les våre vilkår og betingelser for deltakelse på kurs hos KKS AS",
};

export default function VilkarPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-700 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Vilkår og betingelser
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Generelt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  1. Generelle bestemmelser
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Disse vilkårene gjelder for alle kurs og tjenester levert av Kurs og Kompetansesystemer AS 
                  (heretter kalt "KKS"). Ved påmelding til kurs aksepterer du disse vilkårene.
                </p>
                <p>
                  KKS forbeholder seg retten til å endre disse vilkårene. Endringer trer i kraft 
                  ved publisering på nettsiden, men gjelder ikke for allerede inngåtte avtaler.
                </p>
              </CardContent>
            </Card>

            {/* Påmelding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  2. Påmelding og bekreftelse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2.1 Påmelding</h3>
                  <p>
                    Påmelding skjer via vårt nettsystem eller ved kontakt med KKS. Påmeldingen er 
                    bindende når den er registrert i vårt system.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2.2 Bekreftelse</h3>
                  <p>
                    Du vil motta en bekreftelse på e-post etter påmelding. Kontroller at opplysningene 
                    er korrekte og kontakt oss umiddelbart ved eventuelle feil.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2.3 Påmeldingsfrist</h3>
                  <p>
                    Påmelding må skje senest 7 dager før kursstart, med mindre annet er avtalt. 
                    Ved sen påmelding kan det påløpe et gebyr på kr 500,-.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Betaling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  3. Pris og betaling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">3.1 Priser</h3>
                  <p>
                    Alle priser er oppgitt i norske kroner (NOK) inkludert mva. Prisen som gjelder 
                    er den som var gjeldende på påmeldingstidspunktet.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">3.2 Fakturering</h3>
                  <p>
                    Faktura sendes etter kursets gjennomføring med 14 dagers betalingsfrist. 
                    Ved forsinket betaling påløper renter og purregebyr i henhold til lov.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">3.3 Bedriftskunder</h3>
                  <p>
                    For bedriftskunder kan det avtales spesielle betalingsbetingelser og rabatter 
                    ved større volum.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Avbestilling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-primary" />
                  4. Avbestilling og avmelding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">4.1 Avbestillingsregler</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-foreground">Mer enn 14 dager før kursstart:</strong> Ingen kostnader
                    </li>
                    <li>
                      <strong className="text-foreground">8-14 dager før kursstart:</strong> 50% av kursprisen
                    </li>
                    <li>
                      <strong className="text-foreground">Mindre enn 8 dager før kursstart:</strong> 100% av kursprisen
                    </li>
                    <li>
                      <strong className="text-foreground">Uteblitt fremmøte:</strong> 100% av kursprisen
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">4.2 Omplassering</h3>
                  <p>
                    Du kan kostnadsfritt flytte påmeldingen til et annet kurstidspunkt, forutsatt at 
                    det er ledig plass og vi varsles minst 7 dager før kursstart.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">4.3 Navneendring</h3>
                  <p>
                    Du kan bytte deltaker frem til 3 dager før kursstart uten ekstra kostnad.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* KKS sine rettigheter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-primary" />
                  5. KKS sine rettigheter til endringer og avlysning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">5.1 Avlysning</h3>
                  <p>
                    KKS forbeholder seg retten til å avlyse kurs ved for få påmeldinger (minimum 4 deltakere), 
                    instruktørsykdom eller andre uforutsette forhold. Ved avlysning tilbakebetales 
                    hele kursavgiften eller du kan melde deg på et nytt kurs.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">5.2 Endringer</h3>
                  <p>
                    KKS kan endre kursdato, tidspunkt, sted eller instruktør. Ved vesentlige endringer 
                    som ikke passer for deg, kan du avbestille uten kostnad.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">5.3 Varslingsplikt</h3>
                  <p>
                    Ved avlysning eller vesentlige endringer varsles deltakerne så snart som mulig, 
                    normalt minst 7 dager før kursstart.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gjennomføring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  6. Gjennomføring av kurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">6.1 Deltakerkrav</h3>
                  <p>
                    Deltakeren må møte opp i edru tilstand, ha nødvendig grunnleggende ferdigheter 
                    (norskkunnskaper, leseferdigheter, etc.) og medbringe gyldig legitimasjon.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">6.2 Fremmøteplikt</h3>
                  <p>
                    Full deltakelse gjennom hele kurset er nødvendig for å få kompetansebevis. 
                    Ved fravær over 10% kan ikke bevis utstedes.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">6.3 Eksamen og vurdering</h3>
                  <p>
                    Ved kurs med eksamen må deltakeren bestå teoretisk og/eller praktisk prøve. 
                    Én gratis omplassering ved ikke bestått. Deretter må kurset tas på nytt med ny betaling.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">6.4 Bortvising</h3>
                  <p>
                    KKS forbeholder seg retten til å bortvise deltakere som oppfører seg upassende, 
                    er påvirket eller på andre måter bryter kursets regler. Kursavgiften refunderes ikke.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kompetansebevis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  7. Kompetansebevis og sertifikater
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">7.1 Utstedelse</h3>
                  <p>
                    Kompetansebevis utstedes til deltakere som har gjennomført kurset i henhold til 
                    kravene. Beviset sendes digitalt innen 14 dager etter kursets slutt.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">7.2 Gyldighet</h3>
                  <p>
                    Gyldighetsperioden varierer avhengig av kurstype og er spesifisert på beviset. 
                    Det er deltakerens ansvar å fornye kompetansen i tide.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">7.3 Erstatningsbevis</h3>
                  <p>
                    Tapt eller ødelagt bevis kan utstedes på nytt mot et gebyr på kr 300,-.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">7.4 Verifisering</h3>
                  <p>
                    Alle bevis kan verifiseres via vår nettside med unik verifikasjonskode.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ansvar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                  8. Ansvar og ansvarsbegrensning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">8.1 KKS sitt ansvar</h3>
                  <p>
                    KKS leverer kursene i henhold til gjeldende lover og forskrifter og med 
                    forsvarlig faglig innhold. KKS er ikke ansvarlig for indirekte tap som følge 
                    av avlysning eller endringer.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">8.2 Deltakerens ansvar</h3>
                  <p>
                    Deltakeren er selv ansvarlig for skade på eiendom eller personskade forårsaket 
                    under kurset. Deltakeren må ha gyldig forsikring.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">8.3 Force majeure</h3>
                  <p>
                    KKS er ikke ansvarlig for manglende oppfyllelse av avtalen som følge av forhold 
                    utenfor vår kontroll (naturkatastrofer, pandemi, streikeforhold, etc.).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personvern */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  9. Personvern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Behandling av personopplysninger er beskrevet i vår{" "}
                  <a href="/personvern" className="text-primary hover:underline font-semibold">
                    personvernerklæring
                  </a>.
                </p>
                <p>
                  Ved påmelding samtykker du til at KKS behandler dine personopplysninger i 
                  henhold til denne.
                </p>
              </CardContent>
            </Card>

            {/* Opphavsrett */}
            <Card>
              <CardHeader>
                <CardTitle>10. Opphavsrett og immaterielle rettigheter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Alt kursmateriell, presentasjoner og annet innhold levert av KKS er beskyttet av 
                  opphavsretten. Det er ikke tillatt å kopiere, videreselge eller på annen måte 
                  distribuere materiellet uten skriftlig samtykke fra KKS.
                </p>
              </CardContent>
            </Card>

            {/* Tvisteløsning */}
            <Card>
              <CardHeader>
                <CardTitle>11. Tvisteløsning og lovvalg</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">11.1 Klager</h3>
                  <p>
                    Klager skal rettes skriftlig til KKS innen 14 dager etter kursets slutt. 
                    Vi behandler alle klager seriøst og svarer innen rimelig tid.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">11.2 Lovvalg og verneting</h3>
                  <p>
                    Avtalen er underlagt norsk lov. Ved tvist er verneting ved deltakers hjemting, 
                    eller etter KKS sitt valg, ved KKS sitt forretningssted.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kontakt */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>12. Kontaktinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  For spørsmål om våre vilkår og betingelser, kontakt oss:
                </p>
                <div className="space-y-2">
                  <p><strong>E-post:</strong> <a href="mailto:post@kksas.no" className="text-primary hover:underline">post@kksas.no</a></p>
                  <p><strong>Telefon:</strong> <a href="tel:+4799112916" className="text-primary hover:underline">+47 99 11 29 16</a></p>
                  <p><strong>Organisasjonsnummer:</strong> [ORG-NR]</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

