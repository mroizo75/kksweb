import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Shield, Users, FileText, AlertTriangle } from "lucide-react";
import { GDPRAdminActions } from "./client";

export default async function GDPRAdminPage() {
  const session = await auth();
  
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/admin/login");
  }

  // Hent statistikk
  const [totalPersons, personsWithHistory, auditLogs] = await Promise.all([
    db.person.count(),
    db.person.count({
      where: {
        OR: [
          { enrollments: { some: {} } },
          { credentials: { some: {} } },
        ],
      },
    }),
    db.auditLog.findMany({
      where: {
        action: {
          in: ["EXPORT", "DELETE"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GDPR & Personvern (Admin)</h1>
        <p className="text-muted-foreground">
          Administrer GDPR-forespørsler og persondata
        </p>
      </div>

      {/* Statistikk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt personer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPersons}</div>
            <p className="text-xs text-muted-foreground">
              Registrerte personer i systemet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Med historikk</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personsWithHistory}</div>
            <p className="text-xs text-muted-foreground">
              Må anonymiseres ved sletting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDPR-handlinger</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Siste 10 eksport/sletting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GDPR-rettigheter oversikt */}
      <Card>
        <CardHeader>
          <CardTitle>GDPR Compliance</CardTitle>
          <CardDescription>
            Oversikt over implementerte GDPR-rettigheter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-500">✓</Badge>
                <span className="font-medium">Rett til innsyn (Art. 15)</span>
              </div>
              <Badge>Implementert</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-500">✓</Badge>
                <span className="font-medium">Rett til dataportabilitet (Art. 20)</span>
              </div>
              <Badge>Implementert</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-500">✓</Badge>
                <span className="font-medium">Rett til sletting (Art. 17)</span>
              </div>
              <Badge>Implementert</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-500">✓</Badge>
                <span className="font-medium">Anonymisering av historiske data</span>
              </div>
              <Badge>Implementert</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin-handlinger */}
      <GDPRAdminActions />

      {/* Nylige GDPR-handlinger */}
      <Card>
        <CardHeader>
          <CardTitle>Nylige GDPR-handlinger</CardTitle>
          <CardDescription>
            Siste data eksporter og slettinger (fra Audit Log)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Ingen GDPR-handlinger ennå
            </p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={log.action === "DELETE" ? "destructive" : "default"}>
                      {log.action === "EXPORT" ? "Eksport" : "Sletting"}
                    </Badge>
                    <span className="font-medium">{log.user?.email || "Ukjent"}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString("no-NO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viktig informasjon */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-900">Juridiske forpliktelser</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-orange-800 space-y-2 text-sm">
          <p>
            <strong>Lagringsplikt:</strong> Vi er pålagt å oppbevare visse opplysninger i 5 år
            av regnskapsloven og bokføringsloven.
          </p>
          <p>
            <strong>Anonymisering:</strong> Når brukere ber om sletting, anonymiserer vi
            persondata men beholder historiske records av juridiske årsaker.
          </p>
          <p>
            <strong>Responstid:</strong> GDPR krever svar på forespørsler innen 30 dager.
          </p>
          <p>
            <strong>Dokumentasjon:</strong> All behandling av personopplysninger logges i Audit Log.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

