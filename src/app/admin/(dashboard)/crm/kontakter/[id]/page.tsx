"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { PersonDialog } from "@/components/admin/crm/PersonDialog";
import { CrmTimeline } from "@/components/admin/crm/CrmTimeline";
import { TagSelector } from "@/components/admin/crm/TagSelector";
import { EmailLogDialog } from "@/components/admin/crm/EmailLogDialog";
import { assignTagsToPerson } from "@/app/actions/crm/tags";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type {
  Person,
  Company,
  Deal,
  Credential,
  Activity,
  Note,
  EmailLog,
  Tag,
  RenewalTask,
  Course,
  Enrollment,
  CourseSession,
} from "@prisma/client";
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
  LEAD: "bg-blue-100 text-blue-700 border-blue-200",
  QUALIFIED: "bg-cyan-100 text-cyan-700 border-cyan-200",
  PROPOSAL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  NEGOTIATION: "bg-orange-100 text-orange-700 border-orange-200",
  WON: "bg-green-100 text-green-700 border-green-200",
  LOST: "bg-red-100 text-red-700 border-red-200",
};

const enrollmentStatusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  CONFIRMED: { label: "Bekreftet", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  PENDING: { label: "Venter", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  WAITLIST: { label: "Venteliste", className: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  ATTENDED: { label: "Deltatt", className: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  CANCELLED: { label: "Kansellert", className: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  NO_SHOW: { label: "Møtte ikke", className: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle },
};

const credentialStatusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Aktiv", className: "bg-green-100 text-green-700 border-green-200" },
  SUSPENDED: { label: "Suspendert", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  REVOKED: { label: "Tilbakekalt", className: "bg-red-100 text-red-700 border-red-200" },
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

  useEffect(() => {
    loadPerson();
  }, [id]);

  const handleEditClose = (open: boolean) => {
    setEditOpen(open);
    if (!open) loadPerson();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
        Laster...
      </div>
    );
  }
  if (!person) return null;

  const activeCredentials = person.credentials.filter((c) => c.status === "ACTIVE");
  const openRenewals = person.renewalTasks.filter((r) => r.status === "OPEN");
  const timelineCount =
    person.activities.length + person.notes.length + person.emailLogs.length;
  const initials = `${person.firstName[0]}${person.lastName[0]}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push("/admin/crm/kontakter")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Tilbake til kontakter
      </button>

      {/* Person header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xl flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {person.firstName} {person.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {(person as { title?: string | null }).title && (
                  <span className="text-sm text-slate-500">
                    {(person as { title?: string | null }).title}
                  </span>
                )}
                {person.company && (
                  <Link
                    href={`/admin/crm/bedrifter/${person.company.id}`}
                    className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-600 font-medium"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    {person.company.name}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
                {person.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
                    style={{ backgroundColor: tag.color + "22", color: tag.color, borderColor: tag.color + "44" }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {person.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmailOpen(true)}
                className="border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700"
              >
                <Mail className="mr-2 h-3.5 w-3.5" />
                Send e-post
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700"
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Rediger
            </Button>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Kurspåmeldinger", value: person.enrollments.length, icon: GraduationCap, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Aktive sertifikater", value: activeCredentials.length, icon: Award, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Deals", value: person.deals.length, icon: TrendingUp, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Åpne fornyelser", value: openRenewals.length, icon: openRenewals.length > 0 ? AlertTriangle : Clock, color: openRenewals.length > 0 ? "text-orange-700" : "text-slate-700", bg: openRenewals.length > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`rounded-xl border ${kpi.bg} p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${kpi.color}`} />
                <p className={`text-xs font-medium ${kpi.color}`}>{kpi.label}</p>
              </div>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Kontaktinfo</h3>
            <div className="space-y-3">
              {person.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <a href={`mailto:${person.email}`} className="hover:text-amber-700 truncate">
                    {person.email}
                  </a>
                </div>
              )}
              {person.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <a href={`tel:${person.phone}`} className="hover:text-amber-700">
                    {person.phone}
                  </a>
                </div>
              )}
              {person.address && (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {person.address}
                    {person.postalCode && `, ${person.postalCode}`}
                    {person.city && ` ${person.city}`}
                  </span>
                </div>
              )}
              {(person as { linkedinUrl?: string | null }).linkedinUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <a
                    href={(person as { linkedinUrl?: string | null }).linkedinUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    LinkedIn-profil
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4">
              <p className="text-xs text-slate-500 mb-2 font-medium">Tags</p>
              <TagSelector
                selectedTagIds={person.tags.map((t) => t.tag.id)}
                onChange={async (tagIds) => {
                  await assignTagsToPerson(person.id, tagIds);
                  loadPerson();
                }}
              />
            </div>
          </div>

          {openRenewals.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <h3 className="font-semibold text-orange-800 text-sm">
                  Fornyelser ({openRenewals.length})
                </h3>
              </div>
              <div className="space-y-2">
                {openRenewals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-sm text-orange-800">{r.course.title}</span>
                    <span className="text-xs font-semibold text-orange-700 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded-full">
                      {format(new Date(r.dueDate), "dd.MM.yyyy", { locale: nb })}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/admin/crm/renewals">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3 border-orange-300 text-orange-700 hover:border-orange-500 text-xs"
                >
                  Se fornyelsesdashboard
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Main tabs area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <Tabs defaultValue={person.enrollments.length > 0 ? "enrollments" : "credentials"}>
              <div className="border-b border-slate-100 px-2 pt-1">
                <TabsList className="bg-transparent gap-0 h-auto">
                  <TabsTrigger
                    value="enrollments"
                    className="text-xs px-3 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-700"
                  >
                    Påmeldinger ({person.enrollments.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="credentials"
                    className="text-xs px-3 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-700"
                  >
                    Sertifikater ({person.credentials.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="deals"
                    className="text-xs px-3 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-700"
                  >
                    Deals ({person.deals.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="text-xs px-3 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-700"
                  >
                    Tidslinje ({timelineCount})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-5">
                <TabsContent value="enrollments" className="mt-0">
                  {person.enrollments.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <GraduationCap className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Ingen kurspåmeldinger registrert</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {person.enrollments.map((enr) => {
                        const config = enrollmentStatusConfig[enr.status] ?? enrollmentStatusConfig.PENDING;
                        const StatusIcon = config.icon;
                        return (
                          <div
                            key={enr.id}
                            className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{enr.session.course.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {format(new Date(enr.session.startsAt), "EEEE d. MMMM yyyy · HH:mm", { locale: nb })}
                                {enr.session.location && ` · ${enr.session.location}`}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="credentials" className="mt-0">
                  {person.credentials.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <Award className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Ingen sertifikater registrert</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {person.credentials.map((cred) => {
                        const config = credentialStatusConfig[cred.status] ?? credentialStatusConfig.ACTIVE;
                        return (
                          <div key={cred.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{cred.course.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Kode: {cred.code} · Fra: {format(new Date(cred.validFrom), "dd.MM.yyyy", { locale: nb })}
                                {cred.validTo && ` · Til: ${format(new Date(cred.validTo), "dd.MM.yyyy", { locale: nb })}`}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
                              {config.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="deals" className="mt-0">
                  {person.deals.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Ingen deals knyttet til denne personen</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {person.deals.map((deal) => {
                        const stageClass = dealStageColors[deal.stage] ?? "bg-slate-100 text-slate-600 border-slate-200";
                        return (
                          <div key={deal.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                              <p className="font-semibold text-slate-900">{deal.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${stageClass}`}>
                                  {dealStageLabels[deal.stage]}
                                </span>
                                {deal.company && (
                                  <Link
                                    href={`/admin/crm/bedrifter/${deal.company.id}`}
                                    className="text-xs text-slate-500 hover:text-amber-700 flex items-center gap-1"
                                  >
                                    <Building2 className="h-3 w-3" />
                                    {deal.company.name}
                                  </Link>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900 text-sm">
                                {new Intl.NumberFormat("nb-NO", {
                                  style: "currency",
                                  currency: "NOK",
                                  maximumFractionDigits: 0,
                                }).format(deal.value)}
                              </p>
                              <p className="text-xs text-slate-400">{deal.probability}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <CrmTimeline
                    activities={person.activities}
                    notes={person.notes}
                    emailLogs={person.emailLogs}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
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
