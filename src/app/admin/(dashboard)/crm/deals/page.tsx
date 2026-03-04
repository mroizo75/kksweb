"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle, LayoutGrid, List } from "lucide-react";
import { DealDialog } from "@/components/admin/crm/DealDialog";
import { DealKanban } from "@/components/admin/crm/DealKanban";
import { deleteDeal, closeDeal } from "@/app/actions/crm/deals";
import { toast } from "sonner";
import type { Deal, User, Company, Person } from "@prisma/client";

type DealWithRelations = Deal & {
  company: Pick<Company, "id" | "name"> | null;
  person: Pick<Person, "id" | "firstName" | "lastName"> | null;
  assignedTo: Pick<User, "id" | "name" | "email"> | null;
  _count: { activities: number; notesList: number };
};

const stageColors: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-800",
  QUALIFIED: "bg-cyan-100 text-cyan-800",
  PROPOSAL: "bg-yellow-100 text-yellow-800",
  NEGOTIATION: "bg-orange-100 text-orange-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
};

const stageLabels: Record<string, string> = {
  LEAD: "Lead",
  QUALIFIED: "Kvalifisert",
  PROPOSAL: "Tilbud",
  NEGOTIATION: "Forhandling",
  WON: "Vunnet",
  LOST: "Tapt",
};

type ViewMode = "kanban" | "list";

export default function DealsPage() {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/crm/deals");
      const data = await response.json();
      setDeals(data.deals || []);
    } catch {
      toast.error("Kunne ikke laste avtaler");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDeals(); }, []);

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedDeal(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne avtalen?")) return;
    const result = await deleteDeal(id);
    if (result.success) {
      toast.success("Avtale slettet");
      loadDeals();
    } else {
      toast.error(result.error);
    }
  };

  const handleClose = async (id: string, stage: "WON" | "LOST") => {
    const result = await closeDeal(id, stage);
    if (result.success) {
      toast.success(result.message);
      loadDeals();
    } else {
      toast.error(result.error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) loadDeals();
  };

  const activeDeals = deals.filter((d) => !["WON", "LOST"].includes(d.stage));
  const closedDeals = deals.filter((d) => ["WON", "LOST"].includes(d.stage));

  const filteredActive = activeDeals.filter((deal) => {
    const q = searchTerm.toLowerCase();
    return (
      deal.title.toLowerCase().includes(q) ||
      (deal.company?.name || "").toLowerCase().includes(q) ||
      (deal.person ? `${deal.person.firstName} ${deal.person.lastName}`.toLowerCase() : "").includes(q)
    );
  });

  const pipelineValue = activeDeals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">
            {activeDeals.length} aktive deals ·{" "}
            {new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(pipelineValue)} pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ny deal
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Laster...</div>
      ) : viewMode === "kanban" ? (
        <div>
          {activeDeals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Ingen aktive deals i pipeline
            </div>
          ) : (
            <DealKanban
              deals={filteredActive}
              onEdit={handleEdit}
              onRefresh={loadDeals}
            />
          )}
          {closedDeals.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Lukkede deals ({closedDeals.length})</h2>
              <div className="space-y-2">
                {closedDeals.slice(0, 10).map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div>
                      <span className="font-medium">{deal.title}</span>
                      {deal.company && (
                        <span className="text-sm text-muted-foreground ml-2">· {deal.company.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={stageColors[deal.stage]}>{stageLabels[deal.stage]}</Badge>
                      <span className="font-semibold text-sm">
                        {new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(deal.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Avtaleliste</CardTitle>
                <CardDescription>{deals.length} avtaler totalt</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Søk avtaler..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Tittel</th>
                    <th className="text-left p-3 font-medium">Kunde</th>
                    <th className="text-left p-3 font-medium">Verdi</th>
                    <th className="text-left p-3 font-medium">Stadium</th>
                    <th className="text-left p-3 font-medium">Sannsynlighet</th>
                    <th className="text-left p-3 font-medium">Tildelt</th>
                    <th className="text-right p-3 font-medium">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{deal.title}</td>
                      <td className="p-3 text-muted-foreground">
                        {deal.company?.name || (deal.person ? `${deal.person.firstName} ${deal.person.lastName}` : "-")}
                      </td>
                      <td className="p-3">
                        {new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(deal.value)}
                      </td>
                      <td className="p-3">
                        <Badge className={stageColors[deal.stage]}>{stageLabels[deal.stage]}</Badge>
                      </td>
                      <td className="p-3">{deal.probability}%</td>
                      <td className="p-3 text-muted-foreground">{deal.assignedTo?.name || "-"}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          {!["WON", "LOST"].includes(deal.stage) && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleClose(deal.id, "WON")}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Vunnet
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleClose(deal.id, "LOST")}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Tapt
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(deal)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(deal.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <DealDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        deal={selectedDeal}
      />
    </div>
  );
}
