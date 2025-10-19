import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ClientWrapper } from "./client-wrapper";

export default async function SecurityPoliciesPage() {
  // Hent statistikk
  const [total, active, approved, draft, archived] = await Promise.all([
    db.securityPolicy.count(),
    db.securityPolicy.count({ where: { status: "ACTIVE" } }),
    db.securityPolicy.count({ where: { status: "APPROVED" } }),
    db.securityPolicy.count({ where: { status: "DRAFT" } }),
    db.securityPolicy.count({ where: { status: "ARCHIVED" } }),
  ]);

  // Hent politikker
  const policies = await db.securityPolicy.findMany({
    include: {
      _count: {
        select: {
          acknowledgments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const statusConfig = {
    DRAFT: { label: "Utkast", color: "bg-gray-500" },
    REVIEW: { label: "Gjennomgang", color: "bg-yellow-500" },
    APPROVED: { label: "Godkjent", color: "bg-blue-500" },
    ACTIVE: { label: "Aktiv", color: "bg-green-500" },
    ARCHIVED: { label: "Arkivert", color: "bg-gray-400" },
  };

  const categoryConfig = {
    ACCESS_CONTROL: "Tilgangskontroll",
    DATA_PROTECTION: "Databeskyttelse",
    INCIDENT_MANAGEMENT: "Hendelseshåndtering",
    BACKUP_RECOVERY: "Backup & gjenoppretting",
    PASSWORD_POLICY: "Passordpolicy",
    ACCEPTABLE_USE: "Akseptabel bruk",
    CHANGE_MANAGEMENT: "Endringsledelse",
    RISK_MANAGEMENT: "Risikostyring",
    COMPLIANCE: "Compliance",
    TRAINING: "Opplæring",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sikkerhetspolitikk</h1>
          <p className="text-muted-foreground">
            Administrer sikkerhetspolitikker (ISO 27001)
          </p>
        </div>
        <ClientWrapper hasPolicies={policies.length > 0} />
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium text-green-500">Aktive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Godkjente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utkast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Arkivert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Politikker */}
      <Card>
        <CardHeader>
          <CardTitle>Politikker</CardTitle>
          <CardDescription>
            {policies.length} {policies.length === 1 ? "politikk" : "politikker"} funnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy-nr.</TableHead>
                  <TableHead>Tittel</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Versjon</TableHead>
                  <TableHead>Godkjente</TableHead>
                  <TableHead>Opprettet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <p>Ingen sikkerhetspolitikker funnet</p>
                        <p className="text-sm">
                          Klikk "Opprett standard-politikker" for å komme i gang
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <Link
                          href={`/admin/sikkerhet/politikk/${policy.id}`}
                          className="font-mono text-sm hover:underline"
                        >
                          {policy.policyNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/sikkerhet/politikk/${policy.id}`}
                          className="font-medium hover:underline"
                        >
                          {policy.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {categoryConfig[policy.category]}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[policy.status].color}>
                          {statusConfig[policy.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        v{policy.version}
                      </TableCell>
                      <TableCell className="text-sm">
                        {policy._count.acknowledgments} bekreftelser
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(policy.createdAt, "d. MMM yyyy", { locale: nb })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Informasjon om standard-politikker */}
      {policies.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">ISO 27001 Standard-politikker</CardTitle>
            <CardDescription className="text-blue-700">
              Vi har 5 ferdiglagde ISO 27001-godkjente sikkerhetspolitikker klare til bruk
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Tilgangskontroll</strong> - Passordkrav, roller, 2FA, tilgangsstyring</li>
              <li><strong>Databeskyttelse (GDPR)</strong> - Behandlingsgrunnlag, dataportabilitet, sletting</li>
              <li><strong>Passordpolicy</strong> - Krav til passord, 2FA, kontoutsperring</li>
              <li><strong>Hendelseshåndtering</strong> - Rapportering, responstider, varsling</li>
              <li><strong>Backup og gjenoppretting</strong> - RTO/RPO, testing, disaster recovery</li>
            </ul>
            <p className="mt-4 text-sm">
              Hver politikk inkluderer formål, retningslinjer, prosedyrer og gjennomgangsplan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

