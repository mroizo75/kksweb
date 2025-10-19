import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Key, Bell, Lock, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect("/admin/login");
  }

  // Hent brukerinfo
  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    select: {
      name: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    redirect("/admin/login");
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Innstillinger</h1>
        <p className="text-muted-foreground">
          Administrer kontoen og sikkerhetsinnstillingene dine
        </p>
      </div>

      {/* Brukerinformasjon */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profil</CardTitle>
          </div>
          <CardDescription>Din brukerinformasjon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Navn</Label>
            <p className="text-sm">{user.name || "Ikke angitt"}</p>
          </div>
          <div>
            <Label>E-post</Label>
            <p className="text-sm">{user.email}</p>
          </div>
          <div>
            <Label>Rolle</Label>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {user.role === "ADMIN" ? "Administrator" : 
               user.role === "INSTRUCTOR" ? "Instruktør" : "Bruker"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sikkerhet */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Sikkerhet</CardTitle>
          </div>
          <CardDescription>Beskytt kontoen din</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 2FA */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${user.twoFactorEnabled ? "bg-green-100" : "bg-orange-100"}`}>
                {user.twoFactorEnabled ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <Shield className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium">To-faktor autentisering (2FA)</h3>
                <p className="text-sm text-muted-foreground">
                  {user.twoFactorEnabled 
                    ? "Aktivert - Kontoen din er beskyttet" 
                    : "Ikke aktivert - Anbefalt for alle brukere"}
                </p>
                {isAdmin && !user.twoFactorEnabled && (
                  <Badge variant="destructive" className="mt-1">
                    Påkrevd for admin
                  </Badge>
                )}
              </div>
            </div>
            <Link href="/admin/settings/2fa">
              <Button variant={user.twoFactorEnabled ? "outline" : "default"}>
                {user.twoFactorEnabled ? "Administrer" : "Aktiver"}
              </Button>
            </Link>
          </div>

          {/* Passord */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Passord</h3>
                <p className="text-sm text-muted-foreground">
                  Endre passordet ditt
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Endre passord
            </Button>
          </div>

          {/* Varsler */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">E-postvarsler</h3>
                <p className="text-sm text-muted-foreground">
                  Administrer hvilke varsler du mottar
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Innstillinger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ISO 27001 Info */}
      {isAdmin && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">ISO 27001 Sikkerhetskrav</CardTitle>
            </div>
            <CardDescription className="text-blue-700">
              Som administrator må du følge ekstra sikkerhetskrav
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>2FA påkrevd:</strong> To-faktor autentisering er obligatorisk
              </li>
              <li>
                <strong>Passord:</strong> Minimum 12 tegn, komplekse passord
              </li>
              <li>
                <strong>Tilgang:</strong> Alle handlinger logges i audit log
              </li>
              <li>
                <strong>Gjennomgang:</strong> Tilgang gjennomgås kvartalsvis
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-muted-foreground">
      {children}
    </label>
  );
}

