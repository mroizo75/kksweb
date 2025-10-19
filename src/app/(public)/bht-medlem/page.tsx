import { Metadata } from "next";
import { BhtMembershipForm } from "@/components/public/BhtMembershipForm";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Check, Heart, Shield, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Bli BHT-medlem | KKS AS",
  description: "Få tilgang til BHT-tjenester via Dr Dropin med 10% rabatt og HMS Nova for kun 499kr/mnd. Kvalitetssikret og profesjonelt.",
};

export default function BhtMemberPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium">
            <Heart className="h-4 w-4" />
            <span>Fullverdig HMS-løsning</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Bli BHT-medlem hos KKS
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Få tilgang til bedriftshelsetjeneste via Dr Dropin med <strong>10% rabatt</strong> 
            og HMS Nova digitalt kvalitetssystem for kun <strong>499kr/mnd</strong>
          </p>
        </div>
      </section>

      {/* Fordeler */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>BHT via Dr Dropin</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Profesjonelle helsetjenester for dine ansatte med 10% rabatt. 
                  Helseundersøkelser, legetimer, og vaksinering.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>HMS Nova inkludert</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Digitalt kvalitetssystem for kun 499kr/mnd. Alt du trenger 
                  for å oppfylle HMS-kravene.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Automatisk oppfølging</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Vi følger opp dine ansatte med påminnelser om fornyelser, 
                  helseundersøkelser og kursing.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Hva inkluderes */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-2xl">Hva får du som medlem?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">10% rabatt på BHT</p>
                    <p className="text-sm text-muted-foreground">
                      Alle tjenester via Dr Dropin
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">HMS Nova (499kr/mnd)</p>
                    <p className="text-sm text-muted-foreground">
                      Digitalt kvalitetssystem
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Dedikert kontaktperson</p>
                    <p className="text-sm text-muted-foreground">
                      Din HMS-rådgiver hos KKS
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Automatisk varsling</p>
                    <p className="text-sm text-muted-foreground">
                      Vi holder orden på frister
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Kvalitetssikret</p>
                    <p className="text-sm text-muted-foreground">
                      Følger ISO 9001-standarden
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Support når du trenger det</p>
                    <p className="text-sm text-muted-foreground">
                      E-post og telefon
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Påmeldingsskjema */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Meld deg på nå</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Fyll ut skjemaet under så kontakter vi deg innen 24 timer
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Kontaktinformasjon</CardTitle>
              <CardDescription>
                Vi behandler dine personopplysninger i henhold til GDPR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BhtMembershipForm />
            </CardContent>
          </Card>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}

