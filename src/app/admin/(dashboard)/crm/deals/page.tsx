"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { DealDialog } from "@/components/admin/crm/DealDialog";
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
  QUALIFIED: "bg-yellow-100 text-yellow-800",
  PROPOSAL: "bg-orange-100 text-orange-800",
  NEGOTIATION: "bg-purple-100 text-purple-800",
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

export default function DealsPage() {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/crm/deals");
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (error) {
      toast.error("Kunne ikke laste avtaler");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

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
      toast.error(result.error || "Kunne ikke slette avtale");
    }
  };

  const handleClose = async (id: string, stage: "WON" | "LOST") => {
    const result = await closeDeal(id, stage);
    if (result.success) {
      toast.success(result.message);
      loadDeals();
    } else {
      toast.error(result.error || "Kunne ikke lukke avtale");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadDeals();
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      deal.title.toLowerCase().includes(searchLower) ||
      (deal.company?.name || "").toLowerCase().includes(searchLower) ||
      (deal.person
        ? `${deal.person.firstName} ${deal.person.lastName}`.toLowerCase()
        : ""
      ).includes(searchLower)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avtaler</h1>
          <p className="text-muted-foreground">
            Håndter salgsmuligheter og avtaler
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ny Avtale
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Avtale-liste</CardTitle>
              <CardDescription>{filteredDeals.length} avtaler totalt</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laster...</div>
          ) : filteredDeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ingen avtaler funnet
            </div>
          ) : (
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
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{deal.title}</td>
                      <td className="p-3 text-muted-foreground">
                        {deal.company?.name ||
                          (deal.person
                            ? `${deal.person.firstName} ${deal.person.lastName}`
                            : "-")}
                      </td>
                      <td className="p-3">{deal.value.toLocaleString("nb-NO")} kr</td>
                      <td className="p-3">
                        <Badge className={stageColors[deal.stage]}>
                          {stageLabels[deal.stage]}
                        </Badge>
                      </td>
                      <td className="p-3">{deal.probability}%</td>
                      <td className="p-3 text-muted-foreground">
                        {deal.assignedTo?.name || "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          {deal.stage !== "WON" && deal.stage !== "LOST" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClose(deal.id, "WON")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Vunnet
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClose(deal.id, "LOST")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Tapt
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(deal)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(deal.id)}
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

      <DealDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        deal={selectedDeal}
      />
    </div>
  );
}

