import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { QmsKpiDialog } from "@/components/admin/qms/QmsKpiDialog";
import { CalculateKpisButton } from "./client-actions";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
  }>;
}

export default async function KpisPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { category, status } = params;

  // Bygg where-filter
  const where: any = { active: true };

  if (category) {
    where.category = category;
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

  // Hent KPIer
  const kpis = await db.qmsKpi.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      measurements: {
        take: 5,
        orderBy: {
          measuredAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Statistikk
  const stats = {
    onTarget: kpis.filter((k) => k.status === "ON_TARGET").length,
    warning: kpis.filter((k) => k.status === "WARNING").length,
    offTarget: kpis.filter((k) => k.status === "OFF_TARGET").length,
    total: kpis.length,
  };

  // Konfigurasjon
  const categoryConfig: Record<string, { label: string; color: string }> = {
    QUALITY: { label: "Kvalitet", color: "bg-blue-100 text-blue-800" },
    DELIVERY: { label: "Leveranse", color: "bg-green-100 text-green-800" },
    CUSTOMER: {
      label: "Kundetilfredshet",
      color: "bg-purple-100 text-purple-800",
    },
    FINANCIAL: { label: "Økonomi", color: "bg-yellow-100 text-yellow-800" },
    PROCESS: { label: "Prosess", color: "bg-orange-100 text-orange-800" },
    PERSONNEL: { label: "Personell", color: "bg-pink-100 text-pink-800" },
    SAFETY: { label: "HMS", color: "bg-red-100 text-red-800" },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    ON_TARGET: { label: "På mål", color: "bg-green-100 text-green-800" },
    WARNING: { label: "Varsel", color: "bg-yellow-100 text-yellow-800" },
    OFF_TARGET: { label: "Utenfor mål", color: "bg-red-100 text-red-800" },
    NO_DATA: { label: "Ingen data", color: "bg-gray-100 text-gray-800" },
  };

  const frequencyConfig: Record<string, string> = {
    DAILY: "Daglig",
    WEEKLY: "Ukentlig",
    MONTHLY: "Månedlig",
    QUARTERLY: "Kvartalsvis",
    YEARLY: "Årlig",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">KPI & Målstyring</h1>
          <p className="text-muted-foreground mt-2">
            Overvåk og analyser nøkkelindikatorer (ISO 9.1)
          </p>
        </div>
        <div className="flex gap-2">
          <CalculateKpisButton />
          <QmsKpiDialog users={users} />
        </div>
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <Target className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">På mål</p>
              <p className="text-2xl font-bold">{stats.onTarget}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Varsel</p>
              <p className="text-2xl font-bold">{stats.warning}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Utenfor mål</p>
              <p className="text-2xl font-bold">{stats.offTarget}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Totalt</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI-tabell */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">KPI</th>
                <th className="p-4 text-left font-medium">Kategori</th>
                <th className="p-4 text-left font-medium">Siste verdi</th>
                <th className="p-4 text-left font-medium">Mål</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Frekvens</th>
                <th className="p-4 text-left font-medium">Eier</th>
                <th className="p-4 text-left font-medium">Sist målt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {kpis.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Ingen KPIer funnet
                  </td>
                </tr>
              ) : (
                kpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <Link
                        href={`/admin/kvalitet/kpi/${kpi.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {kpi.name}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={categoryConfig[kpi.category].color}
                        variant="outline"
                      >
                        {categoryConfig[kpi.category].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {kpi.currentValue !== null ? (
                        <span className="font-semibold">
                          {kpi.currentValue} {kpi.unit}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {kpi.target} {kpi.unit}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={statusConfig[kpi.status].color}
                        variant="outline"
                      >
                        {statusConfig[kpi.status].label}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {frequencyConfig[kpi.frequency]}
                    </td>
                    <td className="p-4 text-sm">{kpi.owner.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {kpi.lastMeasured ? (
                        format(new Date(kpi.lastMeasured), "dd.MM.yyyy", {
                          locale: nb,
                        })
                      ) : (
                        "-"
                      )}
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

