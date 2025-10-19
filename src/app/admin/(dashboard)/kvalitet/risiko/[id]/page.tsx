import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RiskDetailPage({ params }: PageProps) {
  const { id } = await params;

  const risk = await db.qmsRisk.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!risk) {
    notFound();
  }

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

  function getRiskColor(score: number): string {
    if (score >= 15) return "text-red-600";
    if (score >= 8) return "text-yellow-600";
    return "text-green-600";
  }

  function getRiskLevel(score: number): string {
    if (score >= 15) return "HØY RISIKO";
    if (score >= 8) return "MIDDELS RISIKO";
    return "LAV RISIKO";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/kvalitet/risiko">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Tilbake</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{risk.riskNo}</h1>
            <p className="text-muted-foreground mt-1">{risk.title}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hovedinnhold */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risikodetaljer */}
          <Card>
            <CardHeader>
              <CardTitle>Risikoinformasjon</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Kategori</p>
                  <Badge className={categoryConfig[risk.category].color}>
                    {categoryConfig[risk.category].label}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <Badge className={statusConfig[risk.status].color}>
                    {statusConfig[risk.status].label}
                  </Badge>
                </div>
              </div>

              {risk.description && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">
                    Beskrivelse
                  </p>
                  <p className="text-sm">{risk.description}</p>
                </div>
              )}

              {risk.process && (
                <div>
                  <p className="font-medium text-muted-foreground">Prosess</p>
                  <p>{risk.process}</p>
                </div>
              )}

              {/* Risikovurdering - Før tiltak */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">Risikovurdering (før tiltak)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Sannsynlighet</p>
                    <p className="text-2xl font-bold">{risk.likelihood}</p>
                    <p className="text-xs text-muted-foreground">
                      {
                        {
                          5: "Svært sannsynlig",
                          4: "Sannsynlig",
                          3: "Mulig",
                          2: "Usannsynlig",
                          1: "Svært usannsynlig",
                        }[risk.likelihood]
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Konsekvens</p>
                    <p className="text-2xl font-bold">{risk.consequence}</p>
                    <p className="text-xs text-muted-foreground">
                      {
                        {
                          5: "Kritisk",
                          4: "Alvorlig",
                          3: "Moderat",
                          2: "Mindre",
                          1: "Ubetydelig",
                        }[risk.consequence]
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risikoscore</p>
                    <p className={`text-3xl font-bold ${getRiskColor(risk.riskScore)}`}>
                      {risk.riskScore}
                    </p>
                    <p className={`text-xs font-semibold ${getRiskColor(risk.riskScore)}`}>
                      {getRiskLevel(risk.riskScore)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Restvurdering - Etter tiltak */}
              {risk.residualLikelihood && risk.residualConsequence && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold mb-3 text-green-800">
                    Restvurdering (etter tiltak)
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Sannsynlighet</p>
                      <p className="text-2xl font-bold text-green-800">
                        {risk.residualLikelihood}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Konsekvens</p>
                      <p className="text-2xl font-bold text-green-800">
                        {risk.residualConsequence}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Risikoscore</p>
                      <p
                        className={`text-3xl font-bold ${getRiskColor(
                          risk.residualScore || 0
                        )}`}
                      >
                        {risk.residualScore}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {risk.mitigationPlan && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">
                    Tiltaksplan
                  </p>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p>{risk.mitigationPlan}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Risikoeier</p>
                  <p>{risk.owner.name || risk.owner.email}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Neste revidering
                  </p>
                  <p>
                    {format(new Date(risk.reviewDate), "dd.MM.yyyy", {
                      locale: nb,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidepanel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Opprettet av</p>
                <p>{risk.creator.name || risk.creator.email}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(risk.createdAt), "dd.MM.yyyy HH:mm", {
                    locale: nb,
                  })}
                </p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">
                  Sist oppdatert
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(risk.updatedAt), "dd.MM.yyyy HH:mm", {
                    locale: nb,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Risikoindikator */}
          <Card>
            <CardHeader>
              <CardTitle>Risikonivå</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                {risk.riskScore >= 15 ? (
                  <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-red-600 text-lg">
                      HØY RISIKO
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Umiddelbar handling kreves
                    </p>
                  </div>
                ) : risk.riskScore >= 8 ? (
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-600 text-lg">
                      MIDDELS RISIKO
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tiltak bør iverksettes
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-600 text-lg">
                      LAV RISIKO
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Under kontroll
                    </p>
                  </div>
                )}
              </div>

              {/* Risikomatrise */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-2">Posisjon i matrise:</p>
                <div className="grid grid-cols-5 gap-1">
                  {[5, 4, 3, 2, 1].map((l) =>
                    [1, 2, 3, 4, 5].map((c) => {
                      const score = l * c;
                      const isCurrentRisk =
                        l === risk.likelihood && c === risk.consequence;
                      let bgColor = "bg-green-200";
                      if (score >= 15) bgColor = "bg-red-500";
                      else if (score >= 8) bgColor = "bg-yellow-500";
                      else bgColor = "bg-green-500";

                      return (
                        <div
                          key={`${l}-${c}`}
                          className={`h-6 w-6 rounded ${bgColor} ${
                            isCurrentRisk
                              ? "ring-2 ring-blue-600 ring-offset-2"
                              : ""
                          }`}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

