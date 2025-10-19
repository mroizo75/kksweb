"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, Calendar } from "lucide-react";
import { sendRenewalEmail, sendBulkRenewalEmails, scanForRenewals, updateRenewalStatus } from "@/app/actions/crm/renewals";
import { toast } from "sonner";
import type { RenewalTask, Person, Course, Credential, User } from "@prisma/client";
import { format } from "date-fns";

type RenewalWithRelations = RenewalTask & {
  person: Pick<Person, "id" | "firstName" | "lastName" | "email">;
  course: Pick<Course, "id" | "title" | "slug">;
  credential: Pick<Credential, "id" | "validFrom" | "validTo"> | null;
  assignedTo: Pick<User, "id" | "name"> | null;
};

const statusColors: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  SKIPPED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  OPEN: "Åpen",
  CONTACTED: "Kontaktet",
  COMPLETED: "Fullført",
  SKIPPED: "Hoppet over",
};

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<RenewalWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDays, setFilterDays] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const loadRenewals = async () => {
    setIsLoading(true);
    try {
      const url = filterDays
        ? `/api/admin/crm/renewals?days=${filterDays}`
        : "/api/admin/crm/renewals";
      const response = await fetch(url);
      const data = await response.json();
      setRenewals(data.renewals || []);
    } catch (error) {
      toast.error("Kunne ikke laste fornyelser");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRenewals();
  }, [filterDays]);

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

  const handleUpdateStatus = async (id: string, status: any) => {
    const result = await updateRenewalStatus(id, status);
    if (result.success) {
      toast.success("Status oppdatert");
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornyelser</h1>
          <p className="text-muted-foreground">
            Håndter automatiske påminnelser for kursfornyelser
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="outline" onClick={handleBulkSend}>
              <Mail className="mr-2 h-4 w-4" />
              Send til {selectedIds.length} valgte
            </Button>
          )}
          <Button onClick={handleScan} disabled={isScanning}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
            Scan for nye
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filterDays === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterDays(null)}
        >
          Alle
        </Button>
        <Button
          variant={filterDays === 30 ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterDays(30)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          30 dager
        </Button>
        <Button
          variant={filterDays === 60 ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterDays(60)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          60 dager
        </Button>
        <Button
          variant={filterDays === 90 ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterDays(90)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          90 dager
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fornyelsesliste</CardTitle>
          <CardDescription>{renewals.length} fornyelser totalt</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laster...</div>
          ) : renewals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ingen fornyelser funnet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          e.target.checked
                            ? setSelectedIds(renewals.map((r) => r.id))
                            : setSelectedIds([])
                        }
                      />
                    </th>
                    <th className="text-left p-3 font-medium">Person</th>
                    <th className="text-left p-3 font-medium">Kurs</th>
                    <th className="text-left p-3 font-medium">Utløpsdato</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">E-post sendt</th>
                    <th className="text-right p-3 font-medium">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {renewals.map((renewal) => (
                    <tr key={renewal.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(renewal.id)}
                          onChange={() => toggleSelection(renewal.id)}
                        />
                      </td>
                      <td className="p-3">
                        {renewal.person.firstName} {renewal.person.lastName}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {renewal.person.email}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{renewal.course.title}</td>
                      <td className="p-3 text-muted-foreground">
                        {renewal.credential?.validTo
                          ? format(new Date(renewal.credential.validTo), "dd.MM.yyyy")
                          : format(new Date(renewal.dueDate), "dd.MM.yyyy")}
                      </td>
                      <td className="p-3">
                        <select
                          value={renewal.status}
                          onChange={(e) => handleUpdateStatus(renewal.id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {renewal.emailSentAt
                          ? format(new Date(renewal.emailSentAt), "dd.MM.yyyy HH:mm")
                          : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          {!renewal.emailSentAt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendEmail(renewal.id)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

