"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, User, Building2, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { PersonDialog } from "@/components/admin/crm/PersonDialog";
import { deletePerson } from "@/app/actions/crm/persons";
import { toast } from "sonner";
import type { Person, Company, Tag } from "@prisma/client";
import Link from "next/link";

type PersonWithRelations = Person & {
  title?: string | null;
  company: Pick<Company, "id" | "name"> | null;
  _count: { deals: number; credentials: number; enrollments: number };
  tags: { tag: Tag }[];
};

function KontakterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyFilter = searchParams.get("company");

  const [persons, setPersons] = useState<PersonWithRelations[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadPersons = async () => {
    setIsLoading(true);
    try {
      const url = companyFilter
        ? `/api/admin/crm/persons?company=${companyFilter}`
        : "/api/admin/crm/persons";
      const res = await fetch(url);
      const data = await res.json();
      setPersons(data.persons || []);
    } catch {
      toast.error("Kunne ikke laste kontaktpersoner");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPersons(); }, [companyFilter]);

  const handleEdit = (person: Person) => {
    setSelected(person);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelected(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${name}"?`)) return;
    const result = await deletePerson(id);
    if (result.success) {
      toast.success("Kontaktperson slettet");
      loadPersons();
    } else {
      toast.error(result.error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) loadPersons();
  };

  const filtered = persons.filter((p) => {
    const q = searchTerm.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.phone || "").toLowerCase().includes(q) ||
      (p.company?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kontaktpersoner</h1>
          <p className="text-muted-foreground">
            {companyFilter ? "Kontakter filtrert per bedrift" : "Alle kontaktpersoner i CRM"}
          </p>
        </div>
        <div className="flex gap-2">
          {companyFilter && (
            <Button variant="outline" onClick={() => router.push("/admin/crm/kontakter")}>
              Vis alle
            </Button>
          )}
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ny kontaktperson
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kontaktliste</CardTitle>
              <CardDescription>{filtered.length} kontaktpersoner</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Søk kontakter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laster...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="mx-auto h-8 w-8 mb-2 opacity-40" />
              Ingen kontaktpersoner funnet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Navn</th>
                    <th className="text-left p-3 font-medium">Stilling</th>
                    <th className="text-left p-3 font-medium">Bedrift</th>
                    <th className="text-left p-3 font-medium">Kontakt</th>
                    <th className="text-right p-3 font-medium">Deals</th>
                    <th className="text-right p-3 font-medium">Påmeldinger</th>
                    <th className="text-right p-3 font-medium">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((person) => (
                    <tr
                      key={person.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/admin/crm/kontakter/${person.id}`)}
                    >
                      <td className="p-3">
                          <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs flex-shrink-0">
                            {person.firstName[0]}{person.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium">{person.firstName} {person.lastName}</div>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {person._count.enrollments > 0 && (
                                <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                  Kursdeltaker
                                </span>
                              )}
                              {person.tags.map(({ tag }) => (
                                <span
                                  key={tag.id}
                                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium"
                                  style={{ backgroundColor: tag.color + "22", color: tag.color }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-sm">
                        {(person as any).title || "-"}
                      </td>
                      <td className="p-3">
                        {person.company ? (
                          <Link
                            href={`/admin/crm/bedrifter/${person.company.id}`}
                            className="flex items-center gap-1 text-sm hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {person.company.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-sm space-y-0.5">
                          {person.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {person.email}
                            </div>
                          )}
                          {person.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {person.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm">{person._count.deals}</td>
                      <td className="p-3 text-right text-sm">{person._count.enrollments}</td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(person)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(person.id, `${person.firstName} ${person.lastName}`)}
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

      <PersonDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        person={selected}
        defaultCompanyId={companyFilter || undefined}
      />
    </div>
  );
}

export default function KontakterPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Laster...</div>}>
      <KontakterInner />
    </Suspense>
  );
}
