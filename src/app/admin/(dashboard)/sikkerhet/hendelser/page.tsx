import { Suspense } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ClientWrapper } from "./client-wrapper";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SecurityIncidentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const statusFilter = params?.status as string | undefined;
  const severityFilter = params?.severity as string | undefined;

  // Hent statistikk
  const [total, critical, high, open, investigating, resolved] = await Promise.all([
    db.securityIncident.count(),
    db.securityIncident.count({ where: { severity: "CRITICAL" } }),
    db.securityIncident.count({ where: { severity: "HIGH" } }),
    db.securityIncident.count({ where: { status: "REPORTED" } }),
    db.securityIncident.count({ where: { status: "INVESTIGATING" } }),
    db.securityIncident.count({ where: { status: "RESOLVED" } }),
  ]);

  // Hent hendelser
  const incidents = await db.securityIncident.findMany({
    where: {
      ...(statusFilter && statusFilter !== "ALL" && { status: statusFilter as any }),
      ...(severityFilter && severityFilter !== "ALL" && { severity: severityFilter as any }),
    },
    include: {
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
      assignee: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      detectedAt: "desc",
    },
  });

  const severityConfig = {
    CRITICAL: { label: "Kritisk", color: "bg-red-500" },
    HIGH: { label: "Høy", color: "bg-orange-500" },
    MEDIUM: { label: "Medium", color: "bg-yellow-500" },
    LOW: { label: "Lav", color: "bg-blue-500" },
  };

  const statusConfig = {
    REPORTED: { label: "Rapportert", icon: AlertTriangle, color: "text-red-500" },
    INVESTIGATING: { label: "Utredning", icon: Clock, color: "text-orange-500" },
    CONTAINED: { label: "Inneholdt", icon: CheckCircle, color: "text-blue-500" },
    RESOLVED: { label: "Løst", icon: CheckCircle, color: "text-green-500" },
    CLOSED: { label: "Lukket", icon: XCircle, color: "text-gray-500" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sikkerhetshendelser</h1>
          <p className="text-muted-foreground">
            Overvåk og håndter sikkerhetshendelser (ISO 27001)
          </p>
        </div>
        <ClientWrapper />
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totalt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Kritiske</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-500">Høy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Åpne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utredning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investigating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Løst</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtre */}
      <Card>
        <CardHeader>
          <CardTitle>Hendelser</CardTitle>
          <CardDescription>
            {incidents.length} {incidents.length === 1 ? "hendelse" : "hendelser"} funnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter-knapper her hvis ønskelig */}

            {/* Tabell */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hendelsesnr.</TableHead>
                    <TableHead>Tittel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Alvorlighet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Oppdaget</TableHead>
                    <TableHead>Tildelt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Ingen sikkerhetshendelser funnet
                      </TableCell>
                    </TableRow>
                  ) : (
                    incidents.map((incident) => {
                      const StatusIcon = statusConfig[incident.status].icon;
                      return (
                        <TableRow key={incident.id}>
                          <TableCell>
                            <Link
                              href={`/admin/sikkerhet/hendelser/${incident.id}`}
                              className="font-mono text-sm hover:underline"
                            >
                              {incident.incidentNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/admin/sikkerhet/hendelser/${incident.id}`}
                              className="font-medium hover:underline"
                            >
                              {incident.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {incident.type.replace(/_/g, " ")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={severityConfig[incident.severity].color}
                            >
                              {severityConfig[incident.severity].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${statusConfig[incident.status].color}`} />
                              <span className="text-sm">
                                {statusConfig[incident.status].label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(incident.detectedAt, "d. MMM yyyy", { locale: nb })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {incident.assignee?.name || (
                              <span className="text-muted-foreground">Ikke tildelt</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

