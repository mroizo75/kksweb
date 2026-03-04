"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Trophy, XCircle, Building2, User, Clock } from "lucide-react";
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
}

const STAGES = [
  { id: "LEAD", label: "Lead", color: "border-blue-300 bg-blue-50", headerColor: "bg-blue-500" },
  { id: "QUALIFIED", label: "Kvalifisert", color: "border-cyan-300 bg-cyan-50", headerColor: "bg-cyan-500" },
  { id: "PROPOSAL", label: "Tilbud sendt", color: "border-yellow-300 bg-yellow-50", headerColor: "bg-yellow-500" },
  { id: "NEGOTIATION", label: "Forhandling", color: "border-orange-300 bg-orange-50", headerColor: "bg-orange-500" },
] as const;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DealKanban({ deals, onEdit, onRefresh }: Props) {
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

  return (
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
            <div className={`rounded-xl border-2 transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-transparent bg-muted/40"}`}>
              <div className={`${stage.headerColor} text-white rounded-t-lg px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{stage.label}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                    {stageDeals.length}
                  </Badge>
                </div>
                {totalValue > 0 && (
                  <p className="text-xs text-white/80 mt-0.5">{formatCurrency(totalValue)}</p>
                )}
              </div>

              <div className="p-2 space-y-2 min-h-24">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg border p-3 shadow-sm cursor-grab active:cursor-grabbing transition-opacity ${draggingId === deal.id ? "opacity-50" : "hover:shadow-md"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm leading-tight">{deal.title}</h4>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => onEdit(deal)}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id, deal.title)}
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      {deal.company && (
                        <Link
                          href={`/admin/crm/bedrifter/${deal.company.id}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Building2 className="h-3 w-3" />
                          {deal.company.name}
                        </Link>
                      )}
                      {deal.person && (
                        <Link
                          href={`/admin/crm/kontakter/${deal.person.id}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <User className="h-3 w-3" />
                          {deal.person.firstName} {deal.person.lastName}
                        </Link>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold text-sm">{formatCurrency(deal.value)}</span>
                      <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                    </div>

                    {deal.expectedCloseDate && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(deal.expectedCloseDate), "dd.MM.yy", { locale: nb })}
                      </div>
                    )}

                    <div className="flex gap-1 mt-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs flex-1 text-green-600 hover:bg-green-50 hover:text-green-700"
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
                  <div className="border-2 border-dashed border-primary rounded-lg h-16 flex items-center justify-center">
                    <span className="text-xs text-primary">Slipp her</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
