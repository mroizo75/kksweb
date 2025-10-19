import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Key } from "lucide-react";
import { redirect } from "next/navigation";
import { TwoFactorSettings } from "./client";

export default async function TwoFactorPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect("/admin/login");
  }

  // Hent brukerinfo
  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    select: {
      twoFactorEnabled: true,
      backupCodes: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/admin/login");
  }

  const backupCodesCount = user.backupCodes
    ? (user.backupCodes as string[]).length
    : 0;

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">To-faktor autentisering (2FA)</h1>
        <p className="text-muted-foreground">
          Beskytt kontoen din med ekstra sikkerhetslag (ISO 27001)
        </p>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {user.twoFactorEnabled ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    2FA aktivert
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 text-orange-500" />
                    2FA ikke aktivert
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {user.twoFactorEnabled
                  ? "Kontoen din er beskyttet med to-faktor autentisering"
                  : "Aktiver 2FA for å øke sikkerheten på kontoen din"}
              </CardDescription>
            </div>
            <Badge
              variant={user.twoFactorEnabled ? "default" : "secondary"}
              className={user.twoFactorEnabled ? "bg-green-500" : ""}
            >
              {user.twoFactorEnabled ? "Aktiv" : "Inaktiv"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {user.twoFactorEnabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Key className="h-4 w-4" />
              <span>
                {backupCodesCount} backup-koder gjenstående
                {backupCodesCount < 3 && (
                  <span className="text-orange-500 ml-2">
                    (Generer nye snart)
                  </span>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin-påkrav */}
      {isAdmin && !user.twoFactorEnabled && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">⚠️ ISO 27001 Påkrav</CardTitle>
            <CardDescription className="text-orange-700">
              Som administrator er du <strong>pålagt</strong> å aktivere 2FA i henhold til tilgangskontroll-policyen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-orange-800">
            <p>
              Dette er et sikkerhetskrav for å beskytte sensitive data og administrative funksjoner.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informasjon */}
      <Card>
        <CardHeader>
          <CardTitle>Hva er to-faktor autentisering?</CardTitle>
          <CardDescription>
            2FA legger til et ekstra sikkerhetslag utover passord
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Hvordan fungerer det?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Du logger inn med brukernavn og passord (første faktor)</li>
              <li>Systemet ber om en 6-sifret kode fra telefonen din (andre faktor)</li>
              <li>Koden genereres av en app som Google Authenticator eller Authy</li>
              <li>Koden endres hvert 30. sekund</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2">Fordeler:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Beskytter mot stjålne passord</li>
              <li>Beskytter mot phishing-angrep</li>
              <li>Øker sikkerheten betydelig</li>
              <li>Backup-koder hvis du mister telefonen</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium mb-2 text-blue-900">Anbefalt app:</h3>
            <p className="text-sm text-blue-800">
              Last ned <strong>Google Authenticator</strong> (iOS/Android) eller{" "}
              <strong>Authy</strong> før du aktiverer 2FA.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Innstillinger */}
      <TwoFactorSettings
        enabled={user.twoFactorEnabled}
        backupCodesCount={backupCodesCount}
      />
    </div>
  );
}

