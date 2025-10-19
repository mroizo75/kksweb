import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { QmsRiskDialog } from "@/components/admin/qms/QmsRiskDialog";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
  }>;
}

export default async function RisksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { category, status } = params;

  // Bygg where-filter
  const where: any = {};

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

  // Hent risikoer
  const risks = await db.qmsRisk.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      riskScore: "desc",
    },
  });

  // Statistikk
  const stats = {
    high: risks.filter((r) => r.riskScore >= 15).length, // Score 15-25
    medium: risks.filter((r) => r.riskScore >= 8 && r.riskScore < 15).length, // Score 8-14
    low: risks.filter((r) => r.riskScore < 8).length, // Score 1-7
    total: risks.length,
  };

  // Konfigurasjon
  const categoryConfig: Record<string, { label: string; color: string }> = {
    STRATEGIC: { label: "Strategisk", color: "bg-purple-100 text-purple-800" },
    OPERATIONAL: {
      label: "Operasjonell",
      color: "bg-blue-100 text-blue-800",
    },
    FINANCIAL: { label: "Økonomisk", color: "bg-green-100 text-green-800" },
    COMPLIANCE: { label: "Regelverk", color: "bg-yellow-100 text-yellow-800" },
    REPUTATION: { label: "Omdømme", color: "bg-orange-100 text-orange-800" },
    SAFETY: { label: "HMS/Sikkerhet", color: "bg-red-100 text-red-800" },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    IDENTIFIED: { label: "Identifisert", color: "bg-gray-100 text-gray-800" },
    ASSESSED: { label: "Vurdert", color: "bg-blue-100 text-blue-800" },
    MITIGATED: {
      label: "Tiltak iverksatt",
      color: "bg-yellow-100 text-yellow-800",
    },
    MONITORED: {
      label: "Under overvåkning",
      color: "bg-green-100 text-green-800",
    },
    CLOSED: { label: "Lukket", color: "bg-purple-100 text-purple-800" },
  };

  // Funksjon for å få risikofarge
  function getRiskColor(score: number): string {
    if (score >= 15) return "bg-red-500 text-white";
    if (score >= 8) return "bg-yellow-500 text-gray-900";
    return "bg-green-500 text-white";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Risikohåndtering</h1>
          <p className="text-muted-foreground mt-2">
            Identifiser, vurder og håndter risikoer (ISO 6.1)
          </p>
        </div>
        <QmsRiskDialog users={users} />
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Høy risiko</p>
              <p className="text-2xl font-bold">{stats.high}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Middels risiko</p>
              <p className="text-2xl font-bold">{stats.medium}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Lav risiko</p>
              <p className="text-2xl font-bold">{stats.low}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Totalt</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risikomatrise 5x5 */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Risikomatrise (5×5)</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-sm font-medium bg-muted">
                  Sannsynlighet \ Konsekvens
                </th>
                <th className="border p-2 text-sm font-medium bg-muted">
                  1 - Ubetydelig
                </th>
                <th className="border p-2 text-sm font-medium bg-muted">
                  2 - Mindre
                </th>
                <th className="border p-2 text-sm font-medium bg-muted">
                  3 - Moderat
                </th>
                <th className="border p-2 text-sm font-medium bg-muted">
                  4 - Alvorlig
                </th>
                <th className="border p-2 text-sm font-medium bg-muted">
                  5 - Kritisk
                </th>
              </tr>
            </thead>
            <tbody>
              {[5, 4, 3, 2, 1].map((likelihood) => (
                <tr key={likelihood}>
                  <td className="border p-2 text-sm font-medium bg-muted">
                    {likelihood} -{" "}
                    {
                      {
                        5: "Svært sannsynlig",
                        4: "Sannsynlig",
                        3: "Mulig",
                        2: "Usannsynlig",
                        1: "Svært usannsynlig",
                      }[likelihood]
                    }
                  </td>
                  {[1, 2, 3, 4, 5].map((consequence) => {
                    const score = likelihood * consequence;
                    const color = getRiskColor(score);
                    const risksInCell = risks.filter(
                      (r) => r.likelihood === likelihood && r.consequence === consequence
                    );
                    return (
                      <td
                        key={consequence}
                        className={`border p-2 text-center ${color}`}
                      >
                        <div className="text-sm font-bold">{score}</div>
                        {risksInCell.length > 0 && (
                          <div className="text-xs mt-1">
                            ({risksInCell.length})
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabell */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Risikonr</th>
                <th className="p-4 text-left font-medium">Tittel</th>
                <th className="p-4 text-left font-medium">Kategori</th>
                <th className="p-4 text-left font-medium">Risikoscore</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Eier</th>
                <th className="p-4 text-left font-medium">Neste revidering</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {risks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Ingen risikoer funnet
                  </td>
                </tr>
              ) : (
                risks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <Link
                        href={`/admin/kvalitet/risiko/${risk.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {risk.riskNo}
                      </Link>
                    </td>
                    <td className="p-4 max-w-xs truncate">{risk.title}</td>
                    <td className="p-4">
                      <Badge
                        className={categoryConfig[risk.category].color}
                        variant="outline"
                      >
                        {categoryConfig[risk.category].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getRiskColor(risk.riskScore)}>
                        {risk.riskScore}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={statusConfig[risk.status].color}
                        variant="outline"
                      >
                        {statusConfig[risk.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">{risk.owner.name}</td>
                    <td className="p-4">
                      {format(new Date(risk.reviewDate), "dd.MM.yyyy", {
                        locale: nb,
                      })}
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

