"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  TrendingUp,
  CheckSquare,
  UserPlus,
  BarChart3,
  Trophy,
  XCircle,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";

type PipelineStage = {
  stage: string;
  count: number;
  value: number;
};

type RecentActivity = {
  id: string;
  type: string;
  subject: string;
  status: string;
  createdAt: string;
  createdBy: { name: string | null };
  lead: { name: string } | null;
  deal: { title: string } | null;
  company: { name: string } | null;
  person: { firstName: string; lastName: string } | null;
};

type DashboardData = {
  pipeline: PipelineStage[];
  totalPipelineValue: number;
  totalPipelineDeals: number;
  wonLast30: number;
  lostLast30: number;
  activitiesTotal: number;
  activitiesToday: number;
  openActivities: number;
  newLeadsLast30: number;
  totalLeads: number;
  totalCompanies: number;
  totalPersons: number;
  recentActivities: RecentActivity[];
};

const stageLabels: Record<string, string> = {
  LEAD: "Lead",
  QUALIFIED: "Kvalifisert",
  PROPOSAL: "Tilbud",
  NEGOTIATION: "Forhandling",
};

const stageColors: Record<string, string> = {
  LEAD: "bg-blue-500",
  QUALIFIED: "bg-cyan-500",
  PROPOSAL: "bg-yellow-500",
  NEGOTIATION: "bg-orange-500",
};

const activityIcons: Record<string, React.ElementType> = {
  TASK: CheckSquare,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: FileText,
};

function formatCurrency(amount: number) {
  if (amount >= 1_000_000)
    return `${(amount / 1_000_000).toFixed(1)} mill kr`;
  if (amount >= 1_000)
    return `${(amount / 1_000).toFixed(0)}k kr`;
  return `${amount} kr`;
}

export default function CrmDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/crm/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Kunne ikke laste CRM-data"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-center py-16 text-muted-foreground">Laster dashboard...</div>;
  }

  if (!data) return null;

  const maxPipelineValue = Math.max(...data.pipeline.map((p) => p.value), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
        <p className="text-muted-foreground">Oversikt over pipeline, aktivitet og salgsprogresjon</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              Pipeline-verdi
            </CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(data.totalPipelineValue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{data.totalPipelineDeals} aktive deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-green-600" />
              Vunnet siste 30 dager
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{data.wonLast30}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data.lostLast30} tapt · {data.wonLast30 + data.lostLast30 > 0
                ? Math.round((data.wonLast30 / (data.wonLast30 + data.lostLast30)) * 100)
                : 0}% konvertering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Åpne aktiviteter
            </CardDescription>
            <CardTitle className="text-2xl">{data.openActivities}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{data.activitiesToday} nye i dag</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <UserPlus className="h-3.5 w-3.5" />
              Nye leads (30 dager)
            </CardDescription>
            <CardTitle className="text-2xl">{data.newLeadsLast30}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{data.totalLeads} totalt</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Pipeline</CardTitle>
                <Link href="/admin/crm/deals">
                  <Button variant="ghost" size="sm">
                    Se pipeline <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.pipeline.map((stage) => (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stageColors[stage.stage]}`} />
                      <span className="font-medium">{stageLabels[stage.stage]}</span>
                      <Badge variant="outline" className="text-xs">{stage.count}</Badge>
                    </div>
                    <span className="font-semibold">{formatCurrency(stage.value)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stageColors[stage.stage]}`}
                      style={{ width: `${(stage.value / maxPipelineValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {data.pipeline.every((p) => p.count === 0) && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Ingen aktive deals i pipeline
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nylig aktivitet</CardTitle>
                <Link href="/admin/crm/activities">
                  <Button variant="ghost" size="sm">
                    Se alle <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.recentActivities.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">Ingen aktiviteter ennå</p>
              ) : (
                <div className="space-y-3">
                  {data.recentActivities.map((act) => {
                    const Icon = activityIcons[act.type] || CheckSquare;
                    const target = act.deal?.title || act.lead?.name || act.company?.name ||
                      (act.person ? `${act.person.firstName} ${act.person.lastName}` : null);
                    return (
                      <div key={act.id} className="flex items-start gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted flex-shrink-0 mt-0.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{act.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {act.createdBy.name}
                            {target && ` · ${target}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true, locale: nb })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CRM Oversikt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/crm/bedrifter" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Bedrifter</span>
                </div>
                <span className="font-semibold">{data.totalCompanies}</span>
              </Link>
              <Link href="/admin/crm/kontakter" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Kontaktpersoner</span>
                </div>
                <span className="font-semibold">{data.totalPersons}</span>
              </Link>
              <Link href="/admin/crm/leads" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Leads</span>
                </div>
                <span className="font-semibold">{data.totalLeads}</span>
              </Link>
              <Link href="/admin/crm/deals" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Deals</span>
                </div>
                <span className="font-semibold">{data.totalPipelineDeals}</span>
              </Link>
              <Link href="/admin/crm/activities" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Aktiviteter</span>
                </div>
                <span className="font-semibold">{data.activitiesTotal}</span>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Siste 30 dager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span>Vunnet</span>
                </div>
                <Badge className="bg-green-100 text-green-700">{data.wonLast30}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Tapt</span>
                </div>
                <Badge className="bg-red-100 text-red-700">{data.lostLast30}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  <span>Nye leads</span>
                </div>
                <Badge className="bg-blue-100 text-blue-700">{data.newLeadsLast30}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
