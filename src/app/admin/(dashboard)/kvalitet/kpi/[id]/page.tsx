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
import { ArrowLeft, TrendingUp, Target } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KpiDetailPage({ params }: PageProps) {
  const { id } = await params;

  const kpi = await db.qmsKpi.findUnique({
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
      measurements: {
        include: {
          measurer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          measuredAt: "desc",
        },
        take: 20,
      },
    },
  });

  if (!kpi) {
    notFound();
  }

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
        <div className="flex items-center gap-4">
          <Link href="/admin/kvalitet/kpi">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Tilbake</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{kpi.name}</h1>
            <p className="text-muted-foreground mt-1">
              KPI for {categoryConfig[kpi.category].label.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hovedinnhold */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI-detaljer */}
          <Card>
            <CardHeader>
              <CardTitle>KPI-informasjon</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Kategori</p>
                  <Badge className={categoryConfig[kpi.category].color}>
                    {categoryConfig[kpi.category].label}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <Badge className={statusConfig[kpi.status].color}>
                    {statusConfig[kpi.status].label}
                  </Badge>
                </div>
              </div>

              {kpi.description && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">
                    Beskrivelse
                  </p>
                  <p className="text-sm">{kpi.description}</p>
                </div>
              )}

              {/* Målverdier */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Nåværende verdi</p>
                  <p className="text-2xl font-bold">
                    {kpi.currentValue !== null ? (
                      <>
                        {kpi.currentValue} {kpi.unit}
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mål</p>
                  <p className="text-2xl font-bold text-green-600">
                    {kpi.target} {kpi.unit}
                  </p>
                </div>
                {kpi.threshold && (
                  <div>
                    <p className="text-xs text-muted-foreground">Grenseverdi</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {kpi.threshold} {kpi.unit}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">
                    Målefrekvens
                  </p>
                  <p>{frequencyConfig[kpi.frequency]}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Ansvarlig</p>
                  <p>{kpi.owner.name || kpi.owner.email}</p>
                </div>
              </div>

              {kpi.dataSource && (
                <div>
                  <p className="font-medium text-muted-foreground">Datakilde</p>
                  <p>{kpi.dataSource}</p>
                </div>
              )}

              {kpi.lastMeasured && (
                <div>
                  <p className="font-medium text-muted-foreground">Sist målt</p>
                  <p>
                    {format(new Date(kpi.lastMeasured), "dd.MM.yyyy HH:mm", {
                      locale: nb,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Målingshistorikk */}
          <Card>
            <CardHeader>
              <CardTitle>Målingshistorikk</CardTitle>
              <CardDescription>
                {kpi.measurements.length} måling(er) registrert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kpi.measurements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Ingen målinger registrert ennå
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm">
                        <th className="p-2 text-left font-medium">Dato</th>
                        <th className="p-2 text-left font-medium">Verdi</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        <th className="p-2 text-left font-medium">Målt av</th>
                        <th className="p-2 text-left font-medium">Notat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {kpi.measurements.map((measurement) => {
                        // Beregn status for denne målingen
                        let status: "ON_TARGET" | "WARNING" | "OFF_TARGET" =
                          "ON_TARGET";
                        if (measurement.value >= kpi.target) {
                          status = "ON_TARGET";
                        } else if (
                          kpi.threshold &&
                          measurement.value >= kpi.threshold
                        ) {
                          status = "WARNING";
                        } else {
                          status = "OFF_TARGET";
                        }

                        return (
                          <tr key={measurement.id} className="text-sm">
                            <td className="p-2">
                              {format(
                                new Date(measurement.measuredAt),
                                "dd.MM.yyyy HH:mm",
                                { locale: nb }
                              )}
                            </td>
                            <td className="p-2 font-semibold">
                              {measurement.value} {kpi.unit}
                            </td>
                            <td className="p-2">
                              <Badge className={statusConfig[status].color}>
                                {statusConfig[status].label}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {measurement.measurer.name ||
                                measurement.measurer.email}
                            </td>
                            <td className="p-2 text-muted-foreground">
                              {measurement.note || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
                <p>{kpi.creator.name || kpi.creator.email}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(kpi.createdAt), "dd.MM.yyyy HH:mm", {
                    locale: nb,
                  })}
                </p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">
                  Sist oppdatert
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(kpi.updatedAt), "dd.MM.yyyy HH:mm", {
                    locale: nb,
                  })}
                </p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">Aktiv</p>
                <Badge variant={kpi.active ? "default" : "secondary"}>
                  {kpi.active ? "Ja" : "Nei"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ytelsesindikator */}
          <Card>
            <CardHeader>
              <CardTitle>Ytelse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                {kpi.status === "ON_TARGET" && (
                  <div className="text-center">
                    <Target className="h-16 w-16 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-600">På mål!</p>
                  </div>
                )}
                {kpi.status === "WARNING" && (
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-600">
                      Nær grenseverdi
                    </p>
                  </div>
                )}
                {kpi.status === "OFF_TARGET" && (
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-red-600">Utenfor mål</p>
                  </div>
                )}
                {kpi.status === "NO_DATA" && (
                  <div className="text-center">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-muted-foreground">
                      Ingen data
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

