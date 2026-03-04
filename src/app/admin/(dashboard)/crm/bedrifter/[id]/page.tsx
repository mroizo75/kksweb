"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Users,
  TrendingUp,
  CheckSquare,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { CompanyDialog } from "@/components/admin/crm/CompanyDialog";
import { CrmTimeline } from "@/components/admin/crm/CrmTimeline";
import { TagSelector } from "@/components/admin/crm/TagSelector";
import { EmailLogDialog } from "@/components/admin/crm/EmailLogDialog";
import { assignTagsToCompany } from "@/app/actions/crm/tags";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { Company, Person, Deal, Activity, Note, EmailLog, Tag } from "@prisma/client";
import Link from "next/link";

type CompanyDetail = Company & {
  industry?: string | null;
  website?: string | null;
  description?: string | null;
  people: (Person & {
    tags: { tag: Tag }[];
    _count: { credentials: number; deals: number };
  })[];
  contacts: { id: string; firstName: string; lastName: string; email?: string | null; phone?: string | null; role?: string | null }[];
  deals: (Deal & { assignedTo: { id: string; name: string | null } | null })[];
  activities: (Activity & {
    assignedTo: { id: string; name: string | null } | null;
    createdBy: { id: string; name: string | null };
  })[];
  notes: (Note & { createdBy: { id: string; name: string | null } })[];
  emailLogs: (EmailLog & { sentBy: { id: string; name: string | null } })[];
  tags: { tag: Tag }[];
};

const dealStageLabels: Record<string, string> = {
  LEAD: "Lead",
  QUALIFIED: "Kvalifisert",
  PROPOSAL: "Tilbud",
  NEGOTIATION: "Forhandling",
  WON: "Vunnet",
  LOST: "Tapt",
};

const dealStageColors: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-700",
  QUALIFIED: "bg-cyan-100 text-cyan-700",
  PROPOSAL: "bg-yellow-100 text-yellow-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BedriftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const loadCompany = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/companies/${id}`);
      const data = await res.json();
      if (data.error) {
        toast.error("Bedrift ikke funnet");
        router.push("/admin/crm/bedrifter");
        return;
      }
      setCompany(data.company);
    } catch {
      toast.error("Kunne ikke laste bedrift");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCompany(); }, [id]);

  const handleEditClose = (open: boolean) => {
    setEditOpen(open);
    if (!open) loadCompany();
  };

  if (isLoading) {
    return <div className="text-center py-16 text-muted-foreground">Laster...</div>;
  }

  if (!company) return null;

  const activeDeals = company.deals.filter((d) => !["WON", "LOST"].includes(d.stage));
  const pipelineValue = activeDeals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/crm/bedrifter")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {company.orgNo && (
                <span className="text-sm text-muted-foreground">Org: {company.orgNo}</span>
              )}
              {(company as any).industry && (
                <Badge variant="outline">{(company as any).industry}</Badge>
              )}
              {company.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: tag.color + "22", color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEmailOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Send e-post
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rediger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kontaktpersoner</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              {company.people.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktive deals</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              {activeDeals.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pipeline-verdi</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(pipelineValue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktiviteter</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
              {company.activities.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kontaktinfo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${company.email}`} className="hover:underline truncate">
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{company.phone}</span>
                </div>
              )}
              {(company as any).website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={(company as any).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    {(company as any).website}
                  </a>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{company.address}</span>
                </div>
              )}
              {(company as any).description && (
                <p className="text-sm text-muted-foreground border-t pt-3 mt-3">
                  {(company as any).description}
                </p>
              )}
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <TagSelector
                  selectedTagIds={company.tags.map((t) => t.tag.id)}
                  onChange={async (tagIds) => {
                    await assignTagsToCompany(company.id, tagIds);
                    loadCompany();
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Kontaktpersoner</CardTitle>
              <Link href={`/admin/crm/kontakter?company=${company.id}`}>
                <Button size="sm" variant="ghost">Se alle</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {company.people.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ingen kontaktpersoner</p>
              ) : (
                <div className="space-y-2">
                  {company.people.slice(0, 5).map((person) => (
                    <Link
                      key={person.id}
                      href={`/admin/crm/kontakter/${person.id}`}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs flex-shrink-0">
                        {person.firstName[0]}{person.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{person.firstName} {person.lastName}</div>
                        {person.email && (
                          <div className="text-xs text-muted-foreground truncate">{person.email}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          <Tabs defaultValue="deals">
            <TabsList>
              <TabsTrigger value="deals">Deals ({company.deals.length})</TabsTrigger>
              <TabsTrigger value="timeline">Tidslinje ({company.activities.length + company.notes.length + company.emailLogs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="mt-4">
              {company.deals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Ingen deals knyttet til denne bedriften
                </div>
              ) : (
                <div className="space-y-2">
                  {company.deals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div>
                        <div className="font-medium">{deal.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${dealStageColors[deal.stage]}`}>
                            {dealStageLabels[deal.stage]}
                          </Badge>
                          {deal.expectedCloseDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(deal.expectedCloseDate), "dd.MM.yyyy", { locale: nb })}
                            </span>
                          )}
                          {deal.assignedTo && (
                            <span className="text-xs text-muted-foreground">
                              · {deal.assignedTo.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(deal.value)}</div>
                        <div className="text-xs text-muted-foreground">{deal.probability}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <CrmTimeline
                activities={company.activities}
                notes={company.notes}
                emailLogs={company.emailLogs}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CompanyDialog open={editOpen} onOpenChange={handleEditClose} company={company} />
      <EmailLogDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        defaultToEmail={company.email || ""}
        companyId={company.id}
        onSuccess={loadCompany}
      />
    </div>
  );
}
