"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, TrendingUp, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { LeadDialog } from "@/components/admin/crm/LeadDialog";
import { deleteLead, convertLeadToDeal } from "@/app/actions/crm/leads";
import { toast } from "sonner";
import type { Lead, User } from "@prisma/client";

type LeadWithRelations = Lead & {
  assignedTo: Pick<User, "id" | "name" | "email"> | null;
  _count: { activities: number; notesList: number };
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  QUALIFIED: "bg-green-100 text-green-800",
  CONVERTED: "bg-purple-100 text-purple-800",
  LOST: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  NEW: "Ny",
  CONTACTED: "Kontaktet",
  QUALIFIED: "Kvalifisert",
  CONVERTED: "Konvertert",
  LOST: "Tapt",
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadWithRelations[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/crm/leads");
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      toast.error("Kunne ikke laste leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedLead(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne leaden?")) return;

    const result = await deleteLead(id);
    if (result.success) {
      toast.success("Lead slettet");
      loadLeads();
    } else {
      toast.error(result.error || "Kunne ikke slette lead");
    }
  };

  const handleConvert = async (leadId: string, leadName: string) => {
    const result = await convertLeadToDeal(leadId, `Deal fra ${leadName}`);
    if (result.success) {
      toast.success("Lead konvertert til avtale!");
      loadLeads();
    } else {
      toast.error(result.error || "Kunne ikke konvertere lead");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadLeads();
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchLower) ||
      (lead.email || "").toLowerCase().includes(searchLower) ||
      (lead.phone || "").toLowerCase().includes(searchLower) ||
      (lead.companyName || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Håndter potensielle kunder og konverter til avtaler
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/crm/leads/import")}>
            <Upload className="mr-2 h-4 w-4" />
            Importer Leads
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ny Lead
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lead-liste</CardTitle>
              <CardDescription>{filteredLeads.length} leads totalt</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Søk leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laster...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ingen leads funnet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Navn</th>
                    <th className="text-left p-3 font-medium">Bedrift</th>
                    <th className="text-left p-3 font-medium">E-post</th>
                    <th className="text-left p-3 font-medium">Telefon</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Tildelt</th>
                    <th className="text-right p-3 font-medium">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{lead.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {lead.companyName || "-"}
                      </td>
                      <td className="p-3 text-muted-foreground">{lead.email || "-"}</td>
                      <td className="p-3 text-muted-foreground">{lead.phone || "-"}</td>
                      <td className="p-3">
                        <Badge className={statusColors[lead.status]}>
                          {statusLabels[lead.status]}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {lead.assignedTo?.name || "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          {lead.status === "QUALIFIED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConvert(lead.id, lead.name)}
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Konverter
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(lead)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <LeadDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        lead={selectedLead}
      />
    </div>
  );
}

