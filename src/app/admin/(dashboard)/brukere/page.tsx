"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, ShieldCheck, User } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "INSTRUCTOR";
  createdAt: string;
  _count: { courseOrders: number; leads: number };
}

const emptyForm = { name: "", email: "", password: "", role: "INSTRUCTOR" as "ADMIN" | "INSTRUCTOR" };

export default function BrukerePage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(user: UserRow) {
    setEditing(user);
    setForm({ name: user.name ?? "", email: user.email, password: "", role: user.role });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = "/api/admin/users";
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Noe gikk galt");
        return;
      }

      toast.success(editing ? "Bruker oppdatert" : "Bruker opprettet");
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Kunne ikke slette");
    } else {
      toast.success("Bruker slettet");
      load();
    }
    setDeleteId(null);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" /> Brukeradministrasjon
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administrer instruktører og administratorer
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Ny bruker
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Laster...</div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Navn</th>
                <th className="text-left px-4 py-3 font-medium">E-post</th>
                <th className="text-left px-4 py-3 font-medium">Rolle</th>
                <th className="text-left px-4 py-3 font-medium">Bestillinger</th>
                <th className="text-left px-4 py-3 font-medium">Opprettet</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {user.role === "ADMIN" ? (
                        <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      {user.name ?? "–"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "Admin" : "Instruktør"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user._count.courseOrders}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(user.createdAt), "d. MMM yyyy", { locale: nb })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Ingen brukere funnet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Rediger bruker" : "Ny bruker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Navn</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ola Normann"
              />
            </div>
            <div className="space-y-1.5">
              <Label>E-post</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ola@kksas.no"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{editing ? "Nytt passord (la stå tomt for å beholde)" : "Passord"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? "••••••••" : "Minst 8 tegn"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rolle</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as "ADMIN" | "INSTRUCTOR" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTRUCTOR">Instruktør</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Avbryt</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Lagrer..." : editing ? "Oppdater" : "Opprett"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett bruker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette kan ikke angres. All data tilknyttet brukeren forblir i systemet,
              men brukeren mister tilgang.
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
