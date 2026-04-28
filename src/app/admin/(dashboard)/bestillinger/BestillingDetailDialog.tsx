"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Building2, User, BookOpen, Users, DollarSign, StickyNote } from "lucide-react";

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

interface Props {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}

export function BestillingDetailDialog({ order, onClose }: Props) {
  const customerName = order.company
    ? order.company.name
    : `${order.person?.firstName} ${order.person?.lastName}`;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {customerName}
            <Badge variant={STATUS_VARIANTS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Registrert {format(new Date(order.createdAt), "d. MMMM yyyy 'kl.' HH:mm", { locale: nb })}
            {order.instructor.name ? ` av ${order.instructor.name}` : ""}
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Kunde */}
          <section className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              {order.company ? (
                <Building2 className="h-4 w-4 text-blue-500" />
              ) : (
                <User className="h-4 w-4 text-emerald-500" />
              )}
              {order.company ? "Bedrift" : "Privatperson"}
            </h3>
            {order.company ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Navn</p>
                  <p className="font-medium">{order.company.name}</p>
                </div>
                {order.company.orgNo && (
                  <div>
                    <p className="text-xs text-muted-foreground">Org.nr</p>
                    <p className="font-medium">{order.company.orgNo}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Navn</p>
                  <p className="font-medium">{order.person?.firstName} {order.person?.lastName}</p>
                </div>
                {order.person?.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">E-post</p>
                    <p className="font-medium">{order.person.email}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Kurs */}
          <section className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-500" /> Kurs ({order.courses.length})
            </h3>
            <ul className="space-y-1.5">
              {order.courses.map((c) => (
                <li key={c.course.id} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {c.course.code}
                  </span>
                  {c.course.title}
                </li>
              ))}
            </ul>
          </section>

          {/* Deltakere */}
          <section className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" /> Deltakere ({order.participants.length})
            </h3>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium">Navn</th>
                    <th className="text-left px-3 py-2 text-xs font-medium hidden sm:table-cell">E-post</th>
                    <th className="text-left px-3 py-2 text-xs font-medium hidden sm:table-cell">Telefon</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.participants.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2">{p.firstName} {p.lastName}</td>
                      <td className="px-3 py-2 hidden sm:table-cell text-muted-foreground">{p.email ?? "–"}</td>
                      <td className="px-3 py-2 hidden sm:table-cell text-muted-foreground">{p.phone ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pris */}
          <section className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-green-500" /> Avtalt pris
            </h3>
            <p className="text-3xl font-bold">
              kr {order.agreedPrice.toLocaleString("nb-NO")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              inkl. mva · grunnlag for faktura
            </p>
          </section>

          {/* Notater */}
          {order.notes && (
            <section className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <StickyNote className="h-4 w-4 text-slate-500" /> Notater
              </h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{order.notes}</p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
