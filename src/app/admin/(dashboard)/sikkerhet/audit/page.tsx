import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export default async function AuditLogPage() {
  // Hent siste 200 logs
  const logs = await db.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
  });

  // Statistikk
  const totalLogs = await db.auditLog.count();
  const loginAttempts = await db.auditLog.count({ where: { action: { in: ["LOGIN", "LOGIN_FAILED"] } } });
  const failedLogins = await db.auditLog.count({ where: { action: "LOGIN_FAILED" } });
  const accessDenied = await db.auditLog.count({ where: { action: "ACCESS_DENIED" } });

  const actionLabels: Record<string, string> = {
    LOGIN: "Innlogging",
    LOGOUT: "Utlogging",
    LOGIN_FAILED: "Innlogging feilet",
    PASSWORD_CHANGED: "Passord endret",
    TWO_FACTOR_ENABLED: "2FA aktivert",
    TWO_FACTOR_DISABLED: "2FA deaktivert",
    CREATE: "Opprettet",
    READ: "Lest",
    UPDATE: "Oppdatert",
    DELETE: "Slettet",
    EXPORT: "Eksportert",
    ACCESS_DENIED: "Tilgang nektet",
    PERMISSION_CHANGED: "Tilgang endret",
    ROLE_CHANGED: "Rolle endret",
    USER_CREATED: "Bruker opprettet",
    USER_DELETED: "Bruker slettet",
    LICENSE_SUSPENDED: "Lisens suspendert",
    LICENSE_RESUMED: "Lisens reaktivert",
    DOCUMENT_APPROVED: "Dokument godkjent",
    NONCONFORMANCE_CLOSED: "Avvik lukket",
    RISK_UPDATED: "Risiko oppdatert",
    BACKUP_CREATED: "Backup opprettet",
    SYSTEM_CONFIG_CHANGED: "Systemkonfigurasjon endret",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          Sporingslogg for alle handlinger i systemet (ISO 27001)
        </p>
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totalt logg-innslag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
            <p className="text-xs text-muted-foreground">Viser siste 200</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Innloggingsforsøk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loginAttempts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Feilede innlogginger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedLogins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-500">Tilgang nektet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessDenied}</div>
          </CardContent>
        </Card>
      </div>

      {/* Logg */}
      <Card>
        <CardHeader>
          <CardTitle>Siste aktivitet</CardTitle>
          <CardDescription>
            {logs.length} logg-innslag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tidspunkt</TableHead>
                  <TableHead>Handling</TableHead>
                  <TableHead>Bruker</TableHead>
                  <TableHead>Beskrivelse</TableHead>
                  <TableHead>Entitet</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Ingen logg-innslag funnet
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(log.createdAt, "d. MMM yyyy HH:mm:ss", { locale: nb })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.user ? (
                          <div>
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-muted-foreground text-xs">{log.user.email}</div>
                          </div>
                        ) : log.userEmail ? (
                          <div className="text-muted-foreground">{log.userEmail}</div>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm max-w-md truncate">
                        {log.description || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.entity ? (
                          <div>
                            <div className="font-medium">{log.entity}</div>
                            {log.entityId && (
                              <div className="text-muted-foreground text-xs font-mono">
                                {log.entityId.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

