"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Plus, Search, Trash2, Eye, Building2, User, FileText } from "lucide-react";
import { NyBestillingDialog } from "./NyBestillingDialog";
import { BestillingDetailDialog } from "./BestillingDetailDialog";
import { deleteOrder, updateOrderStatus } from "@/app/actions/bestillinger/orders";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Utkast", CONFIRMED: "Bekreftet", INVOICED: "Fakturert", CANCELLED: "Kansellert",
};
const STATUS_VARIANTS: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  DRAFT: "secondary", CONFIRMED: "default", INVOICED: "outline", CANCELLED: "destructive",
};

interface Participant { id: string; firstName: string; lastName: string; email: string | null; phone: string | null }
interface CourseLine { course: { id: string; title: string; code: string } }

interface Order {
  id: string;
  agreedPrice: number;
  status: "DRAFT" | "CONFIRMED" | "INVOICED" | "CANCELLED";
  notes: string | null;
  createdAt: string;
  company: { id: string; name: string; orgNo: string | null } | null;
  person: { id: string; firstName: string; lastName: string; email: string | null } | null;
  instructor: { id: string; name: string | null };
  courses: CourseLine[];
  participants: Participant[];
}

export default function BestillingerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/bestillinger");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter((o) => {
    const customerName = o.company?.name ?? (o.person ? `${o.person.firstName} ${o.person.lastName}` : "");
    const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.courses.some((c) => c.course.title.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteOrder(deleteId);
    if (result.success) { toast.success(result.message); load(); }
    else toast.error(result.error);
    setDeleteId(null);
  }

  async function handleStatusChange(id: string, status: Order["status"]) {
    const result = await updateOrderStatus(id, status);
    if (result.success) { toast.success(result.message); load(); }
    else toast.error(result.error);
  }

  const totalValue = filtered.reduce((sum, o) => sum + o.agreedPrice, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" /> Bestillinger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kursbestillinger med kunder, deltakere og avtalt pris
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Ny bestilling
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["DRAFT", "CONFIRMED", "INVOICED", "CANCELLED"] as const).map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <div key={s} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk på kunde eller kurs..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statuser</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filtered.length > 0 && (
          <span className="text-sm text-muted-foreground ml-auto">
            {filtered.length} bestilling{filtered.length !== 1 ? "er" : ""} · totalt{" "}
            <strong>kr {totalValue.toLocaleString("nb-NO")}</strong>
          </span>
        )}
      </div>

      {/* Tabell */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Laster...</div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Kunde</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Kurs</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Deltakere</th>
                <th className="text-left px-4 py-3 font-medium">Pris</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Dato</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order) => {
                const customerName = order.company
                  ? order.company.name
                  : `${order.person?.firstName} ${order.person?.lastName}`;
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.company ? (
                          <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
                        ) : (
                          <User className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{customerName}</p>
                          {order.company?.orgNo && (
                            <p className="text-xs text-muted-foreground">
                              Org.nr {order.company.orgNo}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {order.courses.slice(0, 2).map((c) => (
                          <Badge key={c.course.id} variant="outline" className="text-xs">
                            {c.course.code || c.course.title}
                          </Badge>
                        ))}
                        {order.courses.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{order.courses.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {order.participants.length}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      kr {order.agreedPrice.toLocaleString("nb-NO")}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={order.status}
                        onValueChange={(v) => handleStatusChange(order.id, v as Order["status"])}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <Badge variant={STATUS_VARIANTS[order.status]} className="text-xs">
                            {STATUS_LABELS[order.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {format(new Date(order.createdAt), "d. MMM yyyy", { locale: nb })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="icon" variant="ghost"
                          onClick={() => setDetailOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon" variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    {orders.length === 0
                      ? "Ingen bestillinger ennå – trykk «Ny bestilling» for å starte"
                      : "Ingen bestillinger matcher søket"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <NyBestillingDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={load}
      />

      {detailOrder && (
        <BestillingDetailDialog
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onUpdated={load}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett bestilling?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette kan ikke angres. Bestillingen og alle deltakere slettes permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
