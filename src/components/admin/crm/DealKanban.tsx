"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Trophy,
  XCircle,
  Building2,
  User,
  Clock,
  Plus,
} from "lucide-react";
import { updateDealStage, closeDeal, deleteDeal } from "@/app/actions/crm/deals";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { Deal, Company, Person, User as PrismaUser } from "@prisma/client";
import Link from "next/link";

type DealWithRelations = Deal & {
  company: Pick<Company, "id" | "name"> | null;
  person: Pick<Person, "id" | "firstName" | "lastName"> | null;
  assignedTo: Pick<PrismaUser, "id" | "name"> | null;
};

interface Props {
  deals: DealWithRelations[];
  onEdit: (deal: Deal) => void;
  onRefresh: () => void;
  /** Called when the "+ Ny deal" quick-create button is clicked for a specific stage */
  onCreateForStage?: (stage: string) => void;
}

const STAGES = [
  { id: "LEAD", label: "Lead", dotColor: "bg-blue-400", headerBg: "bg-blue-500", dragBg: "bg-blue-50" },
  { id: "QUALIFIED", label: "Kvalifisert", dotColor: "bg-cyan-400", headerBg: "bg-cyan-600", dragBg: "bg-cyan-50" },
  { id: "PROPOSAL", label: "Tilbud sendt", dotColor: "bg-yellow-400", headerBg: "bg-yellow-500", dragBg: "bg-yellow-50" },
  { id: "NEGOTIATION", label: "Forhandling", dotColor: "bg-orange-400", headerBg: "bg-orange-500", dragBg: "bg-orange-50" },
] as const;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DealKanban({ deals, onEdit, onRefresh, onCreateForStage }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggingId(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("dealId", dealId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStage: string) => {
      e.preventDefault();
      const dealId = e.dataTransfer.getData("dealId");
      setDraggingId(null);
      setDragOverStage(null);

      const deal = deals.find((d) => d.id === dealId);
      if (!deal || deal.stage === targetStage) return;

      const result = await updateDealStage(dealId, targetStage);
      if (result.success) {
        onRefresh();
      } else {
        toast.error(result.error);
      }
    },
    [deals, onRefresh]
  );

  const handleClose = async (dealId: string, stage: "WON" | "LOST") => {
    const result = await closeDeal(dealId, stage);
    if (result.success) {
      toast.success(result.message);
      onRefresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (dealId: string, title: string) => {
    if (!confirm(`Slett "${title}"?`)) return;
    const result = await deleteDeal(dealId);
    if (result.success) {
      toast.success("Deal slettet");
      onRefresh();
    } else {
      toast.error(result.error);
    }
  };

  const totalPipeline = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      {/* Pipeline total */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Pipeline total
        </p>
        <p className="font-bold text-slate-900 text-lg">{formatCurrency(totalPipeline)}</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const totalValue = stageDeals.reduce((s, d) => s + d.value, 0);
          const isDragOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72"
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div
                className={`rounded-xl border transition-all ${
                  isDragOver
                    ? `border-amber-400 ${stage.dragBg}`
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {/* Column header */}
                <div className={`${stage.headerBg} rounded-t-xl px-4 py-2.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{stage.label}</span>
                    <span className="bg-white/25 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCreateForStage?.(stage.id)}
                    className="text-white/70 hover:text-white transition-colors"
                    title="Opprett ny deal her"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Column value */}
                {totalValue > 0 && (
                  <div className="px-4 py-2 bg-white/70 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-600">{formatCurrency(totalValue)}</p>
                  </div>
                )}

                {/* Deal cards */}
                <div className="p-2 space-y-2 min-h-24">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl border border-slate-200 p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-slate-300 ${
                        draggingId === deal.id ? "opacity-40 scale-95" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 text-sm leading-tight">{deal.title}</h4>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => onEdit(deal)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                            title="Rediger"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(deal.id, deal.title)}
                            className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                            title="Slett"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-1.5 space-y-0.5">
                        {deal.company && (
                          <Link
                            href={`/admin/crm/bedrifter/${deal.company.id}`}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Building2 className="h-3 w-3" />
                            {deal.company.name}
                          </Link>
                        )}
                        {deal.person && (
                          <Link
                            href={`/admin/crm/kontakter/${deal.person.id}`}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <User className="h-3 w-3" />
                            {deal.person.firstName} {deal.person.lastName}
                          </Link>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{formatCurrency(deal.value)}</span>
                        <span className="text-xs text-slate-400 font-medium">{deal.probability}%</span>
                      </div>

                      {deal.expectedCloseDate && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {format(new Date(deal.expectedCloseDate), "dd.MM.yy", { locale: nb })}
                        </div>
                      )}

                      <div className="flex gap-1 mt-2 pt-2 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs flex-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => handleClose(deal.id, "WON")}
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Vunnet
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs flex-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleClose(deal.id, "LOST")}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Tapt
                        </Button>
                      </div>
                    </div>
                  ))}

                  {isDragOver && draggingId && (
                    <div className="border-2 border-dashed border-amber-400 rounded-xl h-16 flex items-center justify-center">
                      <span className="text-xs text-amber-600 font-medium">Slipp her</span>
                    </div>
                  )}

                  {stageDeals.length === 0 && !isDragOver && (
                    <button
                      type="button"
                      onClick={() => onCreateForStage?.(stage.id)}
                      className="w-full border-2 border-dashed border-slate-200 rounded-xl h-14 flex items-center justify-center text-xs text-slate-400 hover:border-amber-300 hover:text-amber-600 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Legg til deal
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
