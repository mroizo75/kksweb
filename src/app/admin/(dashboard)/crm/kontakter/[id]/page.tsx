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
  Pencil,
  Building2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Award,
  TrendingUp,
  Clock,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { PersonDialog } from "@/components/admin/crm/PersonDialog";
import { CrmTimeline } from "@/components/admin/crm/CrmTimeline";
import { TagSelector } from "@/components/admin/crm/TagSelector";
import { EmailLogDialog } from "@/components/admin/crm/EmailLogDialog";
import { assignTagsToPerson } from "@/app/actions/crm/tags";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { Person, Company, Deal, Credential, Activity, Note, EmailLog, Tag, RenewalTask, Course, Enrollment, CourseSession } from "@prisma/client";
import Link from "next/link";

type EnrollmentWithSession = Enrollment & {
  session: CourseSession & { course: { title: string; code: string } };
};

type PersonDetail = Person & {
  title?: string | null;
  linkedinUrl?: string | null;
  company: Pick<Company, "id" | "name"> | null;
  enrollments: EnrollmentWithSession[];
  credentials: (Credential & { course: { title: string; code: string } })[];
  deals: (Deal & {
    company: Pick<Company, "id" | "name"> | null;
    assignedTo: { id: string; name: string | null } | null;
  })[];
  activities: (Activity & {
    assignedTo: { id: string; name: string | null } | null;
    createdBy: { id: string; name: string | null };
  })[];
  notes: (Note & { createdBy: { id: string; name: string | null } })[];
  emailLogs: (EmailLog & { sentBy: { id: string; name: string | null } })[];
  tags: { tag: Tag }[];
  renewalTasks: (RenewalTask & { course: Pick<Course, "title"> })[];
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

const credentialStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-yellow-100 text-yellow-700",
  REVOKED: "bg-red-100 text-red-700",
};

export default function KontaktDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const loadPerson = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/persons/${id}`);
      const data = await res.json();
      if (data.error) {
        toast.error("Person ikke funnet");
        router.push("/admin/crm/kontakter");
        return;
      }
      setPerson(data.person);
    } catch {
      toast.error("Kunne ikke laste kontaktperson");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPerson(); }, [id]);

  const handleEditClose = (open: boolean) => {
    setEditOpen(open);
    if (!open) loadPerson();
  };

  if (isLoading) return <div className="text-center py-16 text-muted-foreground">Laster...</div>;
  if (!person) return null;

  const activeCredentials = person.credentials.filter((c) => c.status === "ACTIVE");
  const openRenewals = person.renewalTasks.filter((r) => r.status === "OPEN");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/crm/kontakter")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
            {person.firstName[0]}{person.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{person.firstName} {person.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              {(person as any).title && (
                <span className="text-sm text-muted-foreground">{(person as any).title}</span>
              )}
              {person.company && (
                <Link
                  href={`/admin/crm/bedrifter/${person.company.id}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {person.company.name}
                </Link>
              )}
              {person.tags.map(({ tag }) => (
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
          {person.email && (
            <Button variant="outline" onClick={() => setEmailOpen(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Send e-post
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rediger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kurspåmeldinger</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              {person.enrollments.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktive sertifikater</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              {activeCredentials.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Deals</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              {person.deals.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fornyelser</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              {openRenewals.length}
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
              {person.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${person.email}`} className="hover:underline truncate">
                    {person.email}
                  </a>
                </div>
              )}
              {person.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{person.phone}</span>
                </div>
              )}
              {person.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span>
                    {person.address}
                    {person.postalCode && `, ${person.postalCode}`}
                    {person.city && ` ${person.city}`}
                  </span>
                </div>
              )}
              {(person as any).linkedinUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={(person as any).linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate text-blue-600"
                  >
                    LinkedIn-profil
                  </a>
                </div>
              )}
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <TagSelector
                  selectedTagIds={person.tags.map((t) => t.tag.id)}
                  onChange={async (tagIds) => {
                    await assignTagsToPerson(person.id, tagIds);
                    loadPerson();
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {openRenewals.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-orange-700">
                  Fornyelser ({openRenewals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {openRenewals.map((r) => (
                  <div key={r.id} className="text-sm flex items-center justify-between">
                    <span>{r.course.title}</span>
                    <span className="text-orange-600 text-xs">
                      {format(new Date(r.dueDate), "dd.MM.yyyy", { locale: nb })}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-2">
          <Tabs defaultValue={person.enrollments.length > 0 ? "enrollments" : "credentials"}>
            <TabsList>
              <TabsTrigger value="enrollments">
                Påmeldinger ({person.enrollments.length})
              </TabsTrigger>
              <TabsTrigger value="credentials">Sertifikater ({person.credentials.length})</TabsTrigger>
              <TabsTrigger value="deals">Deals ({person.deals.length})</TabsTrigger>
              <TabsTrigger value="timeline">Tidslinje ({person.activities.length + person.notes.length + person.emailLogs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="enrollments" className="mt-4">
              {person.enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Ingen kurspåmeldinger registrert
                </div>
              ) : (
                <div className="space-y-2">
                  {person.enrollments.map((enr) => {
                    const statusColors: Record<string, string> = {
                      CONFIRMED: "bg-green-100 text-green-700",
                      PENDING: "bg-yellow-100 text-yellow-700",
                      WAITLIST: "bg-blue-100 text-blue-700",
                      ATTENDED: "bg-emerald-100 text-emerald-700",
                      CANCELLED: "bg-red-100 text-red-700",
                      NO_SHOW: "bg-gray-100 text-gray-600",
                    };
                    const statusLabels: Record<string, string> = {
                      CONFIRMED: "Bekreftet",
                      PENDING: "Venter",
                      WAITLIST: "Venteliste",
                      ATTENDED: "Deltatt",
                      CANCELLED: "Kansellert",
                      NO_SHOW: "Møtte ikke",
                    };
                    return (
                      <div key={enr.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{enr.session.course.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(enr.session.startsAt), "EEEE d. MMMM yyyy · HH:mm", { locale: nb })}
                            {enr.session.location && ` · ${enr.session.location}`}
                          </div>
                        </div>
                        <Badge className={`text-xs ${statusColors[enr.status] || ""}`}>
                          {statusLabels[enr.status] || enr.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="credentials" className="mt-4">
              {person.credentials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Ingen sertifikater registrert
                </div>
              ) : (
                <div className="space-y-2">
                  {person.credentials.map((cred) => (
                    <div key={cred.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{cred.course.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Kode: {cred.code} · Fra: {format(new Date(cred.validFrom), "dd.MM.yyyy", { locale: nb })}
                          {cred.validTo && ` · Til: ${format(new Date(cred.validTo), "dd.MM.yyyy", { locale: nb })}`}
                        </div>
                      </div>
                      <Badge className={`text-xs ${credentialStatusColors[cred.status] || ""}`}>
                        {cred.status === "ACTIVE" ? "Aktiv" : cred.status === "SUSPENDED" ? "Suspendert" : "Tilbakekalt"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="deals" className="mt-4">
              {person.deals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Ingen deals knyttet til denne personen
                </div>
              ) : (
                <div className="space-y-2">
                  {person.deals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{deal.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${dealStageColors[deal.stage]}`}>
                            {dealStageLabels[deal.stage]}
                          </Badge>
                          {deal.company && (
                            <Link
                              href={`/admin/crm/bedrifter/${deal.company.id}`}
                              className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                            >
                              <Building2 className="h-3 w-3" />
                              {deal.company.name}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(deal.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">{deal.probability}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <CrmTimeline
                activities={person.activities}
                notes={person.notes}
                emailLogs={person.emailLogs}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PersonDialog open={editOpen} onOpenChange={handleEditClose} person={person} />
      <EmailLogDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        defaultToEmail={person.email || ""}
        personId={person.id}
        onSuccess={loadPerson}
      />
    </div>
  );
}
