import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Award, 
  Users, 
  Target, 
  TrendingUp,
  Lightbulb,
  Heart,
  CheckCircle,
  Globe,
} from "lucide-react";

export const metadata = {
  title: "Om oss - KKS AS",
  description: "Lær mer om KKS AS - din partner for profesjonell opplæring og kompetanseutvikling i Norge",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Kvalitetssikrede kurs",
    description: "Vi gir deg den tryggheten som kommer med å vite at du har fått den beste opplæringen som er tilgjengelig, helt i tråd med gjeldende lover og regler.",
  },
  {
    icon: Users,
    title: "Tilpasningsevne",
    description: "Uansett bransje eller behov, kan vi skreddersy kurs som passer perfekt for deg eller din bedrift.",
  },
  {
    icon: TrendingUp,
    title: "Lang erfaring",
    description: "Med mange års erfaring i bransjen vet vi hva som kreves for å levere kurs som gjør en forskjell.",
  },
  {
    icon: Globe,
    title: "Bærekraft",
    description: "Vi integrerer FN's bærekraftsmål for å sikre ansvarlig opplæring som fremmer både personlig vekst og miljøbevissthet.",
  },
];

const services = [
  {
    icon: Award,
    title: "Sertifiserte kurs",
    description: "Vi tilbyr et bredt spekter av sertifiserte kurs som er designet for å møte kravene fra ulike bransjer. Alle kursene våre er utviklet med tanke på å oppfylle og overgå Arbeidstilsynets standarder.",
  },
  {
    icon: Lightbulb,
    title: "Fleksibel læring",
    description: "Vi vet at våre kunder har ulike behov. Derfor tilbyr vi kurs både digitalt og fysisk, slik at du kan velge det formatet som passer best for deg.",
  },
  {
    icon: Users,
    title: "Erfarne instruktører",
    description: "Våre kurs ledes av instruktører med solid erfaring og ekspertise innen sine fagfelt, som sikrer at du får verdifull og praktisk kunnskap.",
  },
  {
    icon: Heart,
    title: "Kundestøtte",
    description: "Vi er med deg hele veien – fra første kontakt til gjennomført kurs. Vårt dedikerte kundestøtteteam er alltid tilgjengelig for å svare på spørsmål og hjelpe deg med å velge riktig kurs.",
  },
];

const timeline = [
  {
    year: "2020",
    title: "Starten",
    description: "KKS AS ble grunnlagt med et mål om å tilby kvalitetsopplæring innen HMS og sikkerhet.",
  },
  {
    year: "2021",
    title: "Sertifisert bedrift",
    description: "Ble offisielt sertifisert som kursleverandør og etablerte solid grunnlag for vekst.",
  },
  {
    year: "2024",
    title: "Ekspansjon",
    description: "Utvidet tilbudet til å inkludere truck, kran og stillaskurs over hele Norge.",
  },
  {
    year: "2025",
    title: "ISO-sertifisering og digitalisering",
    description: "Oppnådde ISO 9001 og ISO 27001 sertifisering for kvalitet og sikkerhet. Lanserte digitale kursløsninger for å møte fremtidens behov.",
  },
];

export default function OmOssPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-700 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Om KKS AS
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              Din pålitelige partner for profesjonell opplæring og kompetanseutvikling
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">Kvalitet og trygghet i læring</h2>
              <p className="text-xl leading-relaxed mb-6">
                Hos <strong>KKS AS (Kurs og Kompetansesystemer)</strong> er vi stolte av å være en ledende leverandør 
                av kurs og kompetansesystemer i Norge. Vi har et sterkt fokus på kvalitet og 
                sikrer at alle våre kurs følger <strong>Arbeidstilsynets</strong> strenge krav og retningslinjer.
              </p>
              <p className="text-xl leading-relaxed mb-8">
                Vårt mål er å gi våre kunder den tryggheten som kommer med å vite at de har fått 
                opplæring som ikke bare er oppdatert og relevant, men også <strong>fullt ut i tråd 
                med lovverket</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visjon */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Target className="h-16 w-16 mx-auto text-primary mb-6" />
            <h2 className="text-4xl font-bold mb-6">Vår visjon</h2>
            <p className="text-xl leading-relaxed">
              Vi i KKS AS er dedikert til å levere kurs av høyeste kvalitet som gir <strong>varig 
              kompetanse</strong> og øker sikkerheten på arbeidsplassen. Vi forstår viktigheten av 
              god opplæring, og vi er her for å støtte både enkeltpersoner og bedrifter i deres 
              læringsreise.
            </p>
          </div>
        </div>
      </section>

      {/* Tjenester */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Våre tjenester</h2>
            <p className="text-xl text-muted-foreground">
              Vi tilbyr omfattende løsninger for din kompetanseutvikling
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service) => (
              <Card key={service.title} className="border-2">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Våre verdier */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Våre verdier</h2>
            <p className="text-xl text-muted-foreground">
              Dette står vi for
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Historie/Tidslinje */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Vår historie</h2>
              <p className="text-xl text-muted-foreground">
                KKS AS har over mange år bygget opp en solid posisjon i markedet, basert på tillit 
                og et ufravikelig engasjement for kvalitet.
              </p>
            </div>
            
            <div className="space-y-8">
              {timeline.map((event, index) => (
                <div key={event.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {event.year}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-1 bg-primary/20 flex-1 mt-2" />
                    )}
                  </div>
                  <Card className="flex-1 mb-4">
                    <CardHeader>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="text-base">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sertifiseringer */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <ShieldCheck className="h-16 w-16 mx-auto text-primary mb-6" />
              <h2 className="text-4xl font-bold mb-4">Sertifiseringer og godkjenninger</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Vi er stolte av å følge de høyeste standardene innen kvalitet og sikkerhet
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    ISO 9001:2015
                  </CardTitle>
                  <CardDescription>
                    Kvalitetsledelsessystem - Sikrer at alle våre prosesser og kurs holder høyeste kvalitet
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    ISO 27001:2013
                  </CardTitle>
                  <CardDescription>
                    Informasjonssikkerhet - Beskytter dine personopplysninger og data
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Arbeidstilsynet
                  </CardTitle>
                  <CardDescription>
                    Alle kurs er godkjent og følger Arbeidstilsynets krav og retningslinjer
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    FN Bærekraftsmål
                  </CardTitle>
                  <CardDescription>
                    Vi integrerer FNs bærekraftsmål i vår opplæring og drift
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

