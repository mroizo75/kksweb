import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck,
  FileText,
  AlertCircle,
  Mail,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Personvernerklæring - KKS AS",
  description: "Les om hvordan KKS AS behandler dine personopplysninger i henhold til GDPR",
};

export default function PersonvernPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Personvernerklæring
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
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  Innledning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  KKS AS (Kurs og Kompetansesystemer AS) tar ditt personvern på alvor. Denne personvernerklæringen 
                  forklarer hvordan vi samler inn, bruker, deler og beskytter dine personopplysninger 
                  i samsvar med EUs personvernforordning (GDPR) og norsk personvernlovgivning.
                </p>
                <p>
                  Ved å bruke våre tjenester aksepterer du vilkårene beskrevet i denne erklæringen.
                </p>
              </CardContent>
            </Card>

            {/* Behandlingsansvarlig */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-primary" />
                  Behandlingsansvarlig
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-2">Kurs og Kompetansesystemer AS</p>
                  <p>Organisasjonsnummer: [ORG-NR]</p>
                  <p>Adresse: [Adresse]</p>
                  <p>E-post: post@kksas.no</p>
                  <p>Telefon: +47 99 11 29 16</p>
                </div>
              </CardContent>
            </Card>

            {/* Hvilke opplysninger */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary" />
                  Hvilke opplysninger samler vi inn?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personopplysninger:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Navn og kontaktinformasjon (e-post, telefon, adresse)</li>
                    <li>Fødselsdato og personnummer (kun når nødvendig for sertifisering)</li>
                    <li>Arbeidsgiverforhold og bedriftsinformasjon</li>
                    <li>Kursdeltagelse og vurderingsresultater</li>
                    <li>Kompetansebevis og sertifikater</li>
                    <li>Profilbilde (valgfritt)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Tekniske opplysninger:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>IP-adresse og enhetstype</li>
                    <li>Informasjonskapsler (cookies)</li>
                    <li>Bruksmønster og preferanser</li>
                    <li>Innloggingshistorikk</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Formål */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary" />
                  Formål med behandlingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>Vi behandler dine personopplysninger for følgende formål:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Primære formål:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Kurspåmelding og administrasjon</li>
                      <li>Utstede kompetansebevis</li>
                      <li>Kommunikasjon om kurs</li>
                      <li>Kundeservice og support</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Sekundære formål:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Kvalitetssikring (ISO 9001)</li>
                      <li>Statistikk og analyse</li>
                      <li>Markedsføring (med samtykke)</li>
                      <li>Juridiske forpliktelser</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rettslig grunnlag */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  Rettslig grunnlag
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>Vi behandler dine personopplysninger basert på:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong className="text-foreground">Avtale:</strong> Når du melder deg på kurs inngår vi 
                    en avtale som krever behandling av dine opplysninger
                  </li>
                  <li>
                    <strong className="text-foreground">Lovpålagt:</strong> Vi må behandle visse opplysninger 
                    for å oppfylle krav fra Arbeidstilsynet og andre myndigheter
                  </li>
                  <li>
                    <strong className="text-foreground">Samtykke:</strong> For markedsføring og valgfrie 
                    tjenester ber vi om ditt samtykke
                  </li>
                  <li>
                    <strong className="text-foreground">Berettiget interesse:</strong> For kvalitetssikring 
                    og forbedring av våre tjenester
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Deling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  Deling av opplysninger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>Vi deler kun dine opplysninger med:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong className="text-foreground">Din arbeidsgiver:</strong> Når du er påmeldt 
                    via bedriften din
                  </li>
                  <li>
                    <strong className="text-foreground">Offentlige myndigheter:</strong> Ved lovpålagt 
                    rapportering
                  </li>
                  <li>
                    <strong className="text-foreground">Databehandlere:</strong> Leverandører som hjelper 
                    oss å levere tjenesten (e-post, hosting, etc.)
                  </li>
                </ul>
                <p className="mt-4">
                  Vi selger <strong className="text-foreground">aldri</strong> dine personopplysninger 
                  til tredjeparter.
                </p>
              </CardContent>
            </Card>

            {/* Lagringstid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary" />
                  Hvor lenge lagrer vi opplysningene?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong className="text-foreground">Kompetansebevis:</strong> 10 år (lovpålagt)
                  </li>
                  <li>
                    <strong className="text-foreground">Kursdeltakelse:</strong> 5 år (bokføringslov)
                  </li>
                  <li>
                    <strong className="text-foreground">Markedsføringssamtykke:</strong> Til du trekker det tilbake
                  </li>
                  <li>
                    <strong className="text-foreground">Tekniske logger:</strong> 6 måneder
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Dine rettigheter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-primary" />
                  Dine rettigheter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>Du har følgende rettigheter etter GDPR:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Innsyn:</strong> Se hvilke opplysninger vi har om deg</li>
                    <li><strong className="text-foreground">Retting:</strong> Rette feil i dine opplysninger</li>
                    <li><strong className="text-foreground">Sletting:</strong> Be om sletting av dine data</li>
                    <li><strong className="text-foreground">Begrensning:</strong> Begrense behandlingen</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Dataportabilitet:</strong> Få utlevert dine data</li>
                    <li><strong className="text-foreground">Protestere:</strong> Mot vår behandling</li>
                    <li><strong className="text-foreground">Klage:</strong> Til Datatilsynet</li>
                    <li><strong className="text-foreground">Trekke samtykke:</strong> Når som helst</li>
                  </ul>
                </div>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">Utøv dine rettigheter:</p>
                  <p>
                    Logg inn på <Link href="/min-side/personvern" className="text-primary hover:underline">Min Side</Link> for 
                    å eksportere eller slette dine data, eller kontakt oss på post@kksas.no
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sikkerhet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  Informasjonssikkerhet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>Vi tar sikkerhet på alvor og har implementert:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-foreground">ISO 27001:</strong> Sertifisert informasjonssikkerhetssystem</li>
                  <li><strong className="text-foreground">Kryptering:</strong> SSL/TLS for all dataoverføring</li>
                  <li><strong className="text-foreground">Tofaktorautentisering:</strong> For admin-tilgang</li>
                  <li><strong className="text-foreground">Tilgangskontroll:</strong> Strengt begrenset tilgang til persondata</li>
                  <li><strong className="text-foreground">Sikkerhetskopier:</strong> Daglig backup med kryptering</li>
                  <li><strong className="text-foreground">Logging:</strong> Omfattende audit trail</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary" />
                  Informasjonskapsler (Cookies)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>Vi bruker følgende typer informasjonskapsler:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong className="text-foreground">Nødvendige:</strong> For innlogging og grunnleggende funksjonalitet
                  </li>
                  <li>
                    <strong className="text-foreground">Funksjonelle:</strong> Husker dine preferanser
                  </li>
                  <li>
                    <strong className="text-foreground">Analyse:</strong> Anonymisert statistikk om bruk (med samtykke)
                  </li>
                </ul>
                <p className="mt-4">
                  Du kan blokkere cookies i nettleseren din, men dette kan påvirke funksjonaliteten.
                </p>
              </CardContent>
            </Card>

            {/* Kontakt */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary" />
                  Kontakt oss om personvern
                </CardTitle>
                <CardDescription>
                  Har du spørsmål om hvordan vi behandler dine personopplysninger?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">E-post:</p>
                  <a href="mailto:post@kksas.no" className="text-primary hover:underline">
                    post@kksas.no
                  </a>
                </div>
                <div>
                  <p className="font-semibold mb-2">Telefon:</p>
                  <a href="tel:+4799112916" className="text-primary hover:underline">
                    +47 99 11 29 16
                  </a>
                </div>
                <div>
                  <p className="font-semibold mb-2">Post:</p>
                  <p className="text-muted-foreground">
                    KKS Kurs & HMS AS<br />
                    [Adresse]<br />
                    [Postnr] [Poststed]
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Datatilsynet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  Klage til Datatilsynet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Dersom du mener at vår behandling av personopplysninger ikke stemmer med det vi 
                  har beskrevet her eller at vi på andre måter bryter personvernlovgivningen, kan 
                  du klage til Datatilsynet:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold text-foreground mb-2">Datatilsynet</p>
                  <p>Postboks 458 Sentrum</p>
                  <p>0105 Oslo</p>
                  <p>E-post: <a href="mailto:postkasse@datatilsynet.no" className="text-primary hover:underline">postkasse@datatilsynet.no</a></p>
                  <p>Nettside: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.datatilsynet.no</a></p>
                </div>
              </CardContent>
            </Card>

            {/* Endringer */}
            <Card>
              <CardHeader>
                <CardTitle>Endringer i personvernerklæringen</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Vi forbeholder oss retten til å oppdatere denne personvernerklæringen. 
                  Eventuelle endringer vil bli publisert på denne siden med oppdatert dato. 
                  Ved vesentlige endringer vil vi varsle deg via e-post eller ved innlogging.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

