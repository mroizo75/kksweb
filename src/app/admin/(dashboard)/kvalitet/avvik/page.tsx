import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ClientWrapper } from "./client-wrapper";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
    severity?: string;
  }>;
}

export default async function NonConformancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { type, status, severity } = params;

  // Bygg where-filter
  const where: any = {};

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (severity) {
    where.severity = severity;
  }

  // Hent data for dialogen
  const [users, companies, courses] = await Promise.all([
    db.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    db.company.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.course.findMany({
      select: { id: true, title: true },
      where: { published: true },
      orderBy: { title: "asc" },
    }),
  ]);

  // Hent avvik
  const nonConformances = await db.qmsNonConformance.findMany({
    where,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
      correctiveActions: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      detectedAt: "desc",
    },
  });

  // Statistikk
  const stats = {
    open: nonConformances.filter((nc) => nc.status === "OPEN").length,
    investigating: nonConformances.filter((nc) => nc.status === "INVESTIGATING").length,
    closed: nonConformances.filter((nc) => nc.status === "CLOSED").length,
    critical: nonConformances.filter((nc) => nc.severity === "CRITICAL").length,
  };

  // Konfigurasjon for typer, statuser, alvorlighetsgrader
  const typeConfig = {
    INTERNAL: { label: "Intern", color: "bg-blue-100 text-blue-800" },
    EXTERNAL: { label: "Ekstern", color: "bg-purple-100 text-purple-800" },
    CUSTOMER: { label: "Kunde", color: "bg-red-100 text-red-800" },
    SUPPLIER: { label: "Leverandør", color: "bg-orange-100 text-orange-800" },
    AUDIT: { label: "Revisjon", color: "bg-yellow-100 text-yellow-800" },
    REGULATORY: { label: "Myndighetskrav", color: "bg-pink-100 text-pink-800" },
  };

  const statusConfig = {
    OPEN: { label: "Åpen", color: "bg-red-100 text-red-800" },
    INVESTIGATING: { label: "Under undersøkelse", color: "bg-yellow-100 text-yellow-800" },
    ACTION: { label: "Tiltak iverksatt", color: "bg-blue-100 text-blue-800" },
    VERIFICATION: { label: "Til verifisering", color: "bg-purple-100 text-purple-800" },
    CLOSED: { label: "Lukket", color: "bg-green-100 text-green-800" },
    REJECTED: { label: "Avvist", color: "bg-gray-100 text-gray-800" },
  };

  const severityConfig = {
    CRITICAL: { label: "Kritisk", color: "bg-red-100 text-red-800" },
    MAJOR: { label: "Alvorlig", color: "bg-orange-100 text-orange-800" },
    MINOR: { label: "Mindre alvorlig", color: "bg-yellow-100 text-yellow-800" },
    OBSERVATION: { label: "Observasjon", color: "bg-blue-100 text-blue-800" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Avvikshåndtering</h1>
          <p className="text-muted-foreground mt-2">
            Registrer og følg opp avvik i kvalitetssystemet
          </p>
        </div>
        <ClientWrapper users={users} companies={companies} courses={courses} />
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Åpne avvik</p>
              <p className="text-2xl font-bold">{stats.open}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Under undersøkelse</p>
              <p className="text-2xl font-bold">{stats.investigating}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Lukket</p>
              <p className="text-2xl font-bold">{stats.closed}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-red-800" />
            <div>
              <p className="text-sm text-muted-foreground">Kritiske</p>
              <p className="text-2xl font-bold">{stats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabell */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">NC-nummer</th>
                <th className="p-4 text-left font-medium">Tittel</th>
                <th className="p-4 text-left font-medium">Type</th>
                <th className="p-4 text-left font-medium">Alvorlighetsgrad</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Ansvarlig</th>
                <th className="p-4 text-left font-medium">Dato oppdaget</th>
                <th className="p-4 text-left font-medium">Tiltak</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {nonConformances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Ingen avvik funnet
                  </td>
                </tr>
              ) : (
                nonConformances.map((nc) => (
                  <tr key={nc.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <Link
                        href={`/admin/kvalitet/avvik/${nc.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {nc.ncNumber}
                      </Link>
                    </td>
                    <td className="p-4 max-w-xs truncate">{nc.title}</td>
                    <td className="p-4">
                      <Badge className={typeConfig[nc.type].color} variant="outline">
                        {typeConfig[nc.type].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={severityConfig[nc.severity].color} variant="outline">
                        {severityConfig[nc.severity].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[nc.status].color} variant="outline">
                        {statusConfig[nc.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {nc.assignee?.name || (
                        <span className="text-muted-foreground italic">Ikke tildelt</span>
                      )}
                    </td>
                    <td className="p-4">
                      {format(new Date(nc.detectedAt), "dd.MM.yyyy", { locale: nb })}
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {nc.correctiveActions.length} tiltak
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

