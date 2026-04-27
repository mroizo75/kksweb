"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  LayoutGrid,
  List,
  TrendingUp,
  Trophy,
  RefreshCw,
} from "lucide-react";
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
  LEAD: "bg-blue-100 text-blue-700 border-blue-200",
  QUALIFIED: "bg-cyan-100 text-cyan-700 border-cyan-200",
  PROPOSAL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  NEGOTIATION: "bg-orange-100 text-orange-700 border-orange-200",
  WON: "bg-green-100 text-green-700 border-green-200",
  LOST: "bg-red-100 text-red-700 border-red-200",
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
  const [initialStage, setInitialStage] = useState<string | null>(null);
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

  useEffect(() => {
    loadDeals();
  }, []);

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setInitialStage(null);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedDeal(null);
    setInitialStage(null);
    setDialogOpen(true);
  };

  const handleCreateForStage = (stage: string) => {
    setSelectedDeal(null);
    setInitialStage(stage);
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
  const wonDeals = deals.filter((d) => d.stage === "WON");
  const lostDeals = deals.filter((d) => d.stage === "LOST");

  const filteredActive = activeDeals.filter((deal) => {
    const q = searchTerm.toLowerCase();
    return (
      deal.title.toLowerCase().includes(q) ||
      (deal.company?.name || "").toLowerCase().includes(q) ||
      (deal.person ? `${deal.person.firstName} ${deal.person.lastName}`.toLowerCase() : "").includes(q)
    );
  });

  const pipelineValue = activeDeals.reduce((s, d) => s + d.value, 0);
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);
  const formatCur = (v: number) =>
    new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeDeals.length} aktive deals · {formatCur(pipelineValue)} i pipeline
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 text-sm transition-all ${
                viewMode === "kanban"
                  ? "bg-amber-500 text-slate-950 font-semibold"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm border-l border-slate-200 transition-all ${
                viewMode === "list"
                  ? "bg-amber-500 text-slate-950 font-semibold"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ny deal
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-medium text-slate-500">Aktiv pipeline</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCur(pipelineValue)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{activeDeals.length} deals</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-700">Vunnet</p>
          </div>
          <p className="text-2xl font-bold text-emerald-800">{formatCur(wonValue)}</p>
          <p className="text-xs text-emerald-600 mt-0.5">{wonDeals.length} deals</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <p className="text-xs font-medium text-red-600">Tapt</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{lostDeals.length}</p>
          <p className="text-xs text-red-500 mt-0.5">deals</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Laster...
        </div>
      ) : viewMode === "kanban" ? (
        <div>
          {activeDeals.length === 0 && !searchTerm ? (
            <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-600">Ingen aktive deals</p>
              <p className="text-sm mt-1">Opprett din første deal for å komme i gang</p>
              <Button
                onClick={handleCreate}
                className="mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ny deal
              </Button>
            </div>
          ) : (
            <DealKanban
              deals={filteredActive}
              onEdit={handleEdit}
              onRefresh={loadDeals}
              onCreateForStage={handleCreateForStage}
            />
          )}

          {/* Closed deals */}
          {(wonDeals.length > 0 || lostDeals.length > 0) && (
            <div className="mt-8">
              <h2 className="text-base font-semibold text-slate-700 mb-3">
                Lukkede deals ({wonDeals.length + lostDeals.length})
              </h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {[...wonDeals, ...lostDeals].slice(0, 10).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <span className="font-medium text-slate-900 text-sm">{deal.title}</span>
                        {deal.company && (
                          <span className="text-xs text-slate-400 ml-2">· {deal.company.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${stageColors[deal.stage]}`}
                        >
                          {stageLabels[deal.stage]}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm">{formatCur(deal.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
            <p className="font-semibold text-slate-900 text-sm">Avtaleliste ({deals.length})</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Søk avtaler..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm border-slate-200 w-52"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Tittel", "Kunde", "Verdi", "Stadium", "Sannsynlighet", "Tildelt", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals
                  .filter((deal) => {
                    const q = searchTerm.toLowerCase();
                    return (
                      deal.title.toLowerCase().includes(q) ||
                      (deal.company?.name || "").toLowerCase().includes(q)
                    );
                  })
                  .map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{deal.title}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {deal.company?.name ||
                          (deal.person ? `${deal.person.firstName} ${deal.person.lastName}` : "-")}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatCur(deal.value)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${stageColors[deal.stage]}`}
                        >
                          {stageLabels[deal.stage]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{deal.probability}%</td>
                      <td className="px-4 py-3 text-slate-400">{deal.assignedTo?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {!["WON", "LOST"].includes(deal.stage) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClose(deal.id, "WON")}
                                className="border-slate-200 text-emerald-700 hover:bg-emerald-50 h-7 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Vunnet
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClose(deal.id, "LOST")}
                                className="border-slate-200 text-red-600 hover:bg-red-50 h-7 text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Tapt
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(deal)}
                            className="h-7 text-slate-400 hover:text-slate-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(deal.id)}
                            className="h-7 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DealDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        deal={selectedDeal}
        defaultStage={initialStage ?? undefined}
      />
    </div>
  );
}
