"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  Users,
  TrendingUp,
  ExternalLink,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CompanyDialog } from "@/components/admin/crm/CompanyDialog";
import { deleteCompany } from "@/app/actions/crm/companies";
import { toast } from "sonner";
import type { Company, Tag } from "@prisma/client";

type CompanyWithStats = Company & {
  _count: { people: number; deals: number; activities: number };
  deals: { value: number }[];
  tags: { tag: Tag }[];
  industry?: string | null;
  website?: string | null;
  description?: string | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(amount);
}

export default function BedrifterPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/crm/companies");
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch {
      toast.error("Kunne ikke laste bedrifter");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCompanies(); }, []);

  const handleEdit = (company: Company) => {
    setSelected(company);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelected(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${name}"?`)) return;
    const result = await deleteCompany(id);
    if (result.success) {
      toast.success("Bedrift slettet");
      loadCompanies();
    } else {
      toast.error(result.error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) loadCompanies();
  };

  const filtered = companies.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.orgNo || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      ((c as any).industry || "").toLowerCase().includes(q)
    );
  });

  const totalPipelineValue = filtered.reduce(
    (sum, c) => sum + c.deals.reduce((s, d) => s + d.value, 0),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bedrifter</h1>
          <p className="text-muted-foreground">
            Administrer bedriftskunder og pipeline-verdi
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ny bedrift
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Totalt bedrifter</CardDescription>
            <CardTitle className="text-2xl">{filtered.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktive deals</CardDescription>
            <CardTitle className="text-2xl">
              {filtered.reduce((s, c) => s + c._count.deals, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pipeline-verdi</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalPipelineValue)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bedriftsliste</CardTitle>
              <CardDescription>{filtered.length} bedrifter</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Søk bedrifter..."
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
              <Building2 className="mx-auto h-8 w-8 mb-2 opacity-40" />
              Ingen bedrifter funnet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Bedrift</th>
                    <th className="text-left p-3 font-medium">Bransje</th>
                    <th className="text-left p-3 font-medium">Kontakt</th>
                    <th className="text-right p-3 font-medium">Kontakter</th>
                    <th className="text-right p-3 font-medium">Deals</th>
                    <th className="text-right p-3 font-medium">Pipeline</th>
                    <th className="text-right p-3 font-medium">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((company) => {
                    const pipelineValue = company.deals.reduce((s, d) => s + d.value, 0);
                    return (
                      <tr
                        key={company.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/admin/crm/bedrifter/${company.id}`)}
                      >
                        <td className="p-3">
                          <div className="font-medium">{company.name}</div>
                          {company.orgNo && (
                            <div className="text-xs text-muted-foreground">Org: {company.orgNo}</div>
                          )}
                          {company.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {company.tags.map(({ tag }) => (
                                <span
                                  key={tag.id}
                                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                  style={{ backgroundColor: tag.color + "22", color: tag.color }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {(company as any).industry || "-"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <div>{company.email || "-"}</div>
                          <div className="text-xs">{company.phone || ""}</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {company._count.people}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                            {company._count.deals}
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {pipelineValue > 0 ? formatCurrency(pipelineValue) : "-"}
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {(company as any).website && (
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                              >
                                <a
                                  href={(company as any).website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Globe className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(company)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(company.id, company.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        company={selected}
      />
    </div>
  );
}
