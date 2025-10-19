import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { QmsAuditDialog } from "@/components/admin/qms/QmsAuditDialog";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
  }>;
}

export default async function AuditsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { type, status } = params;

  // Bygg where-filter
  const where: any = {};

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  // Hent brukere for dialog
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Hent revisjoner
  const audits = await db.qmsAudit.findMany({
    where,
    include: {
      lead: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      plannedDate: "desc",
    },
  });

  // Statistikk
  const stats = {
    planned: audits.filter((a) => a.status === "PLANNED").length,
    inProgress: audits.filter((a) => a.status === "IN_PROGRESS").length,
    completed: audits.filter((a) => a.status === "COMPLETED").length,
    total: audits.length,
  };

  // Konfigurasjon
  const typeConfig: Record<string, { label: string; color: string }> = {
    INTERNAL: { label: "Internrevisjon", color: "bg-blue-100 text-blue-800" },
    EXTERNAL: {
      label: "Ekstern revisjon",
      color: "bg-purple-100 text-purple-800",
    },
    SUPPLIER: {
      label: "Leverandørrevisjon",
      color: "bg-green-100 text-green-800",
    },
    CUSTOMER: {
      label: "Kunderevisjon",
      color: "bg-orange-100 text-orange-800",
    },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    PLANNED: { label: "Planlagt", color: "bg-gray-100 text-gray-800" },
    IN_PROGRESS: { label: "Pågår", color: "bg-blue-100 text-blue-800" },
    REPORTING: {
      label: "Rapportskriving",
      color: "bg-yellow-100 text-yellow-800",
    },
    COMPLETED: { label: "Fullført", color: "bg-green-100 text-green-800" },
    CLOSED: { label: "Lukket", color: "bg-purple-100 text-purple-800" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revisjoner</h1>
          <p className="text-muted-foreground mt-2">
            Internrevisjoner og eksterne revisjoner (ISO 9.2)
          </p>
        </div>
        <QmsAuditDialog users={users} />
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-sm text-muted-foreground">Planlagt</p>
              <p className="text-2xl font-bold">{stats.planned}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pågår</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Fullført</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Totalt</p>
              <p className="text-2xl font-bold">{stats.total}</p>
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
                <th className="p-4 text-left font-medium">Revisjonsnr</th>
                <th className="p-4 text-left font-medium">Type</th>
                <th className="p-4 text-left font-medium">Omfang</th>
                <th className="p-4 text-left font-medium">Planlagt dato</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Revisjonsleder</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Ingen revisjoner funnet
                  </td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <Link
                        href={`/admin/kvalitet/revisjoner/${audit.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {audit.auditNo}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={typeConfig[audit.type].color}
                        variant="outline"
                      >
                        {typeConfig[audit.type].label}
                      </Badge>
                    </td>
                    <td className="p-4 max-w-xs truncate">{audit.scope}</td>
                    <td className="p-4">
                      {format(new Date(audit.plannedDate), "dd.MM.yyyy", {
                        locale: nb,
                      })}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={statusConfig[audit.status].color}
                        variant="outline"
                      >
                        {statusConfig[audit.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">{audit.lead.name}</td>
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

