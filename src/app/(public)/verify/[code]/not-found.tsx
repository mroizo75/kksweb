import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function VerifyNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Kompetansebevis Verifisering
          </h1>
          <p className="text-gray-600">
            Offentlig verifikasjon av kompetanse og sertifiseringer
          </p>
        </div>

        <Card className="border-red-200 border-2">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle>Kompetansebevis ikke funnet</CardTitle>
                <CardDescription>
                  Vi kunne ikke finne et kompetansebevis med denne koden
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                Kompetansebeviset du prøver å verifisere eksisterer ikke i vårt system.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900 font-medium mb-2">
                  Mulige årsaker:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                  <li>Koden er skrevet inn feil</li>
                  <li>QR-koden er skadet eller ugyldig</li>
                  <li>Kompetansebeviset er trukket tilbake</li>
                  <li>Kompetansebeviset er ikke registrert ennå</li>
                </ul>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Hvis du mener dette er en feil, vennligst kontakt KKS AS
                  direkte for assistanse.
                </p>

                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/">Tilbake til forsiden</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/kontakt">Kontakt oss</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

