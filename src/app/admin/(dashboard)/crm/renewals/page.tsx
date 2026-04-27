"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
  X,
} from "lucide-react";
import {
  sendRenewalEmail,
  sendBulkRenewalEmails,
  scanForRenewals,
  updateRenewalStatus,
} from "@/app/actions/crm/renewals";
import { toast } from "sonner";
import { format } from "date-fns";
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

const urgencyOrder: Record<string, number> = {
  expired: 0,
  critical: 1,
  warning: 2,
  normal: 3,
};

function UrgencyBadge({ days, urgency }: { days: number; urgency: string }) {
  if (urgency === "expired") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle className="h-3 w-3" />
        Utløpt ({Math.abs(days)} dager siden)
      </span>
    );
  }
  if (urgency === "critical") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
        <AlertTriangle className="h-3 w-3" />
        {days} dager igjen
      </span>
    );
  }
  if (urgency === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        <Clock className="h-3 w-3" />
        {days} dager igjen
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      <CheckCircle className="h-3 w-3" />
      {days} dager igjen
    </span>
  );
}

function ConfirmDialog({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-lg">Bekreft bulk-utsendelse</h3>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          Du er i ferd med å sende fornyelsespåminnelse til{" "}
          <strong className="text-slate-900">{count} person{count > 1 ? "er" : ""}</strong>. Kun
          personer med gyldig e-postadresse vil motta e-post.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-slate-300 text-slate-700"
            onClick={onCancel}
          >
            Avbryt
          </Button>
          <Button
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            onClick={onConfirm}
          >
            Send til {count}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<RenewalRow[]>([]);
  const [courses, setCourses] = useState<CourseRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const [filterDays, setFilterDays] = useState<number | null>(null);
  const [filterCourseId, setFilterCourseId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const expired = renewals.filter((r) => r.urgency === "expired").length;
  const critical = renewals.filter((r) => r.urgency === "critical").length;
  const warning = renewals.filter((r) => r.urgency === "warning").length;
  const total = renewals.length;

  const loadRenewals = useCallback(async () => {
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
  }, [filterDays, filterCourseId, filterStatus]);

  useEffect(() => {
    loadRenewals();
  }, [loadRenewals]);

  const filtered = renewals
    .filter((r) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        `${r.person.firstName} ${r.person.lastName}`.toLowerCase().includes(q) ||
        (r.person.email || "").toLowerCase().includes(q) ||
        (r.person.company?.name || "").toLowerCase().includes(q) ||
        r.course.title.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.daysUntilExpiry - b.daysUntilExpiry;
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
    setShowBulkConfirm(false);
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
      {showBulkConfirm && (
        <ConfirmDialog
          count={selectedIds.length}
          onConfirm={handleBulkSend}
          onCancel={() => setShowBulkConfirm(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fornyelser</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Følg opp kunder med utløpende kurs — YSK/Diisocyanater (5 år), HMS (2 år), m.fl.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedIds.length > 0 && (
            <Button
              onClick={() => setShowBulkConfirm(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send til {selectedIds.length} valgte
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleScan}
            disabled={isScanning}
            className="border-slate-300 text-slate-700"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
            Scan for nye
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Totalt", value: total, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200", icon: null },
          { label: "Utløpt / forfalt", value: expired, color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
          { label: "Kritisk (< 30 dager)", value: critical, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: AlertTriangle },
          { label: "Advarsel (30–90 dager)", value: warning, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: Clock },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border ${kpi.border} ${kpi.bg} p-4`}>
            <p className={`text-xs font-medium ${kpi.color} mb-1`}>{kpi.label}</p>
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Søk person, bedrift, kurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
          {[null, 30, 60, 90, 180].map((d) => (
            <button
              key={d ?? "all"}
              type="button"
              onClick={() => setFilterDays(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                filterDays === d
                  ? "bg-amber-500 text-slate-950 border-amber-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-400"
              }`}
            >
              {d == null ? "Alle" : `${d} d`}
            </button>
          ))}
        </div>

        {courses.length > 0 && (
          <select
            value={filterCourseId}
            onChange={(e) => setFilterCourseId(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
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
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
        >
          <option value="">Åpne + Kontaktet</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            Fornyelsesliste
          </p>
          <p className="text-xs text-slate-500">
            {filtered.length} fornyelser
            {selectedIds.length > 0 && ` · ${selectedIds.length} valgt`}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Laster...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <CheckCircle className="mx-auto h-10 w-10 mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">Ingen fornyelser funnet</p>
            <p className="text-sm mt-1">Klikk "Scan for nye" for å finne utløpende sertifikater</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 w-8">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      onChange={(e) => toggleAll(e.target.checked)}
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    />
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Person</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kurs</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utløp</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Haster</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((renewal) => {
                  const expiryDate = renewal.credential?.validTo
                    ? new Date(renewal.credential.validTo)
                    : new Date(renewal.dueDate);

                  const rowBorderClass =
                    renewal.urgency === "expired"
                      ? "border-l-2 border-l-red-400"
                      : renewal.urgency === "critical"
                      ? "border-l-2 border-l-orange-400"
                      : renewal.urgency === "warning"
                      ? "border-l-2 border-l-yellow-400"
                      : "";

                  return (
                    <tr
                      key={renewal.id}
                      className={`hover:bg-slate-50 transition-colors ${rowBorderClass}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={selectedIds.includes(renewal.id)}
                          onChange={() => toggleSelection(renewal.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/crm/kontakter/${renewal.person.id}`}
                          className="flex items-center gap-1.5 font-semibold text-slate-900 hover:text-amber-700 text-sm"
                        >
                          <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          {renewal.person.firstName} {renewal.person.lastName}
                        </Link>
                        {renewal.person.company && (
                          <Link
                            href={`/admin/crm/bedrifter/${renewal.person.company.id}`}
                            className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 hover:text-amber-700"
                          >
                            <Building2 className="h-3 w-3" />
                            {renewal.person.company.name}
                          </Link>
                        )}
                        {renewal.person.email && (
                          <p className="text-xs text-slate-400 mt-0.5">{renewal.person.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 text-sm">{renewal.course.title}</p>
                        {renewal.course.validityYears && (
                          <p className="text-xs text-slate-400">{renewal.course.validityYears} års gyldighet</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {format(expiryDate, "dd.MM.yyyy", { locale: nb })}
                        {renewal.credential?.validFrom && (
                          <p className="text-xs text-slate-400">
                            Fra: {format(new Date(renewal.credential.validFrom), "dd.MM.yyyy", { locale: nb })}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <UrgencyBadge
                          days={renewal.daysUntilExpiry}
                          urgency={renewal.urgency}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={renewal.status}
                          onChange={(e) => handleUpdateStatus(renewal.id, e.target.value)}
                          className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-700"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {renewal.emailSentAt && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            E-post: {format(new Date(renewal.emailSentAt), "dd.MM.yy HH:mm", { locale: nb })}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendEmail(renewal.id)}
                            disabled={!renewal.person.email}
                            className="border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 text-xs h-7"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            {renewal.emailSentAt ? "Send igjen" : "Send"}
                          </Button>
                          <Link href={`/admin/crm/kontakter/${renewal.person.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-500 hover:text-slate-900 text-xs h-7"
                            >
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
      </div>
    </div>
  );
}
