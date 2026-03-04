"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mail,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle,
  Building2,
  User,
  Search,
  Filter,
} from "lucide-react";
import {
  sendRenewalEmail,
  sendBulkRenewalEmails,
  scanForRenewals,
  updateRenewalStatus,
} from "@/app/actions/crm/renewals";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";

type CourseRef = { id: string; title: string };

type RenewalRow = {
  id: string;
  status: string;
  dueDate: string;
  emailSentAt: string | null;
  notes: string | null;
  daysUntilExpiry: number;
  urgency: "expired" | "critical" | "warning" | "normal";
  person: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    company: { id: string; name: string } | null;
  };
  course: { id: string; title: string; slug: string; validityYears: number | null };
  credential: { id: string; validFrom: string; validTo: string | null } | null;
  assignedTo: { id: string; name: string | null } | null;
};

const statusLabels: Record<string, string> = {
  OPEN: "Åpen",
  CONTACTED: "Kontaktet",
  COMPLETED: "Fullført",
  SKIPPED: "Hoppet over",
};

function UrgencyBadge({ days, urgency }: { days: number; urgency: string }) {
  if (urgency === "expired") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">
        <AlertTriangle className="h-3 w-3" />
        Utløpt ({Math.abs(days)} dager siden)
      </span>
    );
  }
  if (urgency === "critical") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700">
        <AlertTriangle className="h-3 w-3" />
        {days} dager igjen
      </span>
    );
  }
  if (urgency === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700">
        <Clock className="h-3 w-3" />
        {days} dager igjen
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
      <CheckCircle className="h-3 w-3" />
      {days} dager igjen
    </span>
  );
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<RenewalRow[]>([]);
  const [courses, setCourses] = useState<CourseRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Filter state
  const [filterDays, setFilterDays] = useState<number | null>(null);
  const [filterCourseId, setFilterCourseId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // KPI counts
  const expired = renewals.filter((r) => r.urgency === "expired").length;
  const critical = renewals.filter((r) => r.urgency === "critical").length;
  const warning = renewals.filter((r) => r.urgency === "warning").length;

  const loadRenewals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDays) params.set("days", String(filterDays));
      if (filterCourseId) params.set("courseId", filterCourseId);
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/admin/crm/renewals?${params.toString()}`);
      const data = await res.json();
      setRenewals(data.renewals || []);
      setCourses(data.courses || []);
    } catch {
      toast.error("Kunne ikke laste fornyelser");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRenewals();
  }, [filterDays, filterCourseId, filterStatus]);

  const filtered = renewals.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      `${r.person.firstName} ${r.person.lastName}`.toLowerCase().includes(q) ||
      (r.person.email || "").toLowerCase().includes(q) ||
      (r.person.company?.name || "").toLowerCase().includes(q) ||
      r.course.title.toLowerCase().includes(q)
    );
  });

  const handleSendEmail = async (id: string) => {
    const result = await sendRenewalEmail(id);
    if (result.success) {
      toast.success("Påminnelse sendt");
      loadRenewals();
    } else {
      toast.error(result.error || "Kunne ikke sende påminnelse");
    }
  };

  const handleBulkSend = async () => {
    if (selectedIds.length === 0) {
      toast.error("Velg minst én fornyelse");
      return;
    }
    const result = await sendBulkRenewalEmails(selectedIds);
    if (result.success) {
      toast.success(result.message);
      setSelectedIds([]);
      loadRenewals();
    } else {
      toast.error(result.error || "Kunne ikke sende påminnelser");
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    const result = await scanForRenewals();
    if (result.success) {
      toast.success(result.message);
      loadRenewals();
    } else {
      toast.error(result.error || "Kunne ikke scanne for fornyelser");
    }
    setIsScanning(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const result = await updateRenewalStatus(
      id,
      status as "OPEN" | "CONTACTED" | "COMPLETED" | "SKIPPED"
    );
    if (result.success) {
      loadRenewals();
    } else {
      toast.error(result.error || "Kunne ikke oppdatere status");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map((r) => r.id) : []);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornyelser</h1>
          <p className="text-muted-foreground">
            Følg opp kunder med utløpende kurs – YSK/Diisocyanater (5 år), HMS (2 år), m.fl.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="outline" onClick={handleBulkSend}>
              <Mail className="mr-2 h-4 w-4" />
              Send til {selectedIds.length} valgte
            </Button>
          )}
          <Button onClick={handleScan} disabled={isScanning} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
            Scan for nye
          </Button>
        </div>
      </div>

      {/* KPI-kort */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-700">Utløpt / forfalt</CardDescription>
            <CardTitle className="text-2xl text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {expired}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-200 bg-orange-50/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-700">Utløper innen 30 dager</CardDescription>
            <CardTitle className="text-2xl text-orange-700 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {critical}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-700">Utløper innen 90 dager</CardDescription>
            <CardTitle className="text-2xl text-yellow-700 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {warning}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søk person, bedrift, kurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-56"
          />
        </div>

        <div className="flex items-center gap-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {[null, 30, 60, 90, 180].map((d) => (
            <Button
              key={d ?? "all"}
              variant={filterDays === d ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterDays(d)}
            >
              {d == null ? "Alle" : `${d} dager`}
            </Button>
          ))}
        </div>

        {courses.length > 0 && (
          <select
            value={filterCourseId}
            onChange={(e) => setFilterCourseId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Alle kurs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        )}

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Åpne + Kontaktet</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fornyelsesliste</CardTitle>
          <CardDescription>
            {filtered.length} fornyelser
            {selectedIds.length > 0 && ` · ${selectedIds.length} valgt`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laster...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="mx-auto h-10 w-10 mb-3 opacity-30" />
              <p>Ingen fornyelser funnet</p>
              <p className="text-sm mt-1">Klikk "Scan for nye" for å finne utløpende sertifikater</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 w-8">
                      <input
                        type="checkbox"
                        onChange={(e) => toggleAll(e.target.checked)}
                        checked={
                          filtered.length > 0 &&
                          selectedIds.length === filtered.length
                        }
                      />
                    </th>
                    <th className="text-left p-3 font-medium">Person</th>
                    <th className="text-left p-3 font-medium">Kurs</th>
                    <th className="text-left p-3 font-medium">Utløp</th>
                    <th className="text-left p-3 font-medium">Haster</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((renewal) => {
                    const expiryDate = renewal.credential?.validTo
                      ? new Date(renewal.credential.validTo)
                      : new Date(renewal.dueDate);

                    const rowBg =
                      renewal.urgency === "expired"
                        ? "bg-red-50/50 hover:bg-red-50"
                        : renewal.urgency === "critical"
                        ? "bg-orange-50/50 hover:bg-orange-50"
                        : renewal.urgency === "warning"
                        ? "bg-yellow-50/30 hover:bg-yellow-50/60"
                        : "hover:bg-muted/50";

                    return (
                      <tr key={renewal.id} className={`border-b ${rowBg}`}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(renewal.id)}
                            onChange={() => toggleSelection(renewal.id)}
                          />
                        </td>
                        <td className="p-3">
                          <Link
                            href={`/admin/crm/kontakter/${renewal.person.id}`}
                            className="flex items-center gap-1.5 font-medium hover:underline"
                          >
                            <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            {renewal.person.firstName} {renewal.person.lastName}
                          </Link>
                          {renewal.person.company && (
                            <Link
                              href={`/admin/crm/bedrifter/${renewal.person.company.id}`}
                              className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 hover:underline"
                            >
                              <Building2 className="h-3 w-3" />
                              {renewal.person.company.name}
                            </Link>
                          )}
                          {renewal.person.email && (
                            <div className="text-xs text-muted-foreground">
                              {renewal.person.email}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{renewal.course.title}</div>
                          {renewal.course.validityYears && (
                            <div className="text-xs text-muted-foreground">
                              {renewal.course.validityYears} års gyldighet
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {format(expiryDate, "dd.MM.yyyy", { locale: nb })}
                          {renewal.credential?.validFrom && (
                            <div className="text-xs">
                              Fra: {format(new Date(renewal.credential.validFrom), "dd.MM.yyyy", { locale: nb })}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <UrgencyBadge
                            days={renewal.daysUntilExpiry}
                            urgency={renewal.urgency}
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={renewal.status}
                            onChange={(e) =>
                              handleUpdateStatus(renewal.id, e.target.value)
                            }
                            className="border rounded px-2 py-1 text-xs bg-background"
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          {renewal.emailSentAt && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              E-post: {format(new Date(renewal.emailSentAt), "dd.MM.yy HH:mm", { locale: nb })}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant={renewal.emailSentAt ? "ghost" : "outline"}
                              onClick={() => handleSendEmail(renewal.id)}
                              disabled={!renewal.person.email}
                              title={
                                renewal.emailSentAt
                                  ? "Send ny påminnelse"
                                  : "Send påminnelse"
                              }
                            >
                              <Mail className="h-3.5 w-3.5 mr-1" />
                              {renewal.emailSentAt ? "Send igjen" : "Send"}
                            </Button>
                            <Link href={`/admin/crm/kontakter/${renewal.person.id}`}>
                              <Button size="sm" variant="ghost">
                                CRM
                              </Button>
                            </Link>
                          </div>
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
  );
}
