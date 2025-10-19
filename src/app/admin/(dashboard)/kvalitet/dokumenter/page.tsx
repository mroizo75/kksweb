import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { QmsDocumentDialog } from "@/components/admin/qms/QmsDocumentDialog";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { category, status, search } = params;

  // Bygg where-filter
  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { documentNo: { contains: search } },
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Hent brukere for dialog
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Hent dokumenter
  const documents = await db.qmsDocument.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Statistikk
  const stats = {
    draft: documents.filter((d) => d.status === "DRAFT").length,
    review: documents.filter((d) => d.status === "REVIEW").length,
    effective: documents.filter((d) => d.status === "EFFECTIVE").length,
    total: documents.length,
  };

  // Konfigurasjon
  const categoryConfig: Record<string, { label: string; color: string }> = {
    PROCEDURE: { label: "Prosedyre", color: "bg-blue-100 text-blue-800" },
    INSTRUCTION: {
      label: "Instruksjon",
      color: "bg-green-100 text-green-800",
    },
    FORM: { label: "Skjema", color: "bg-yellow-100 text-yellow-800" },
    POLICY: { label: "Policy", color: "bg-purple-100 text-purple-800" },
    MANUAL: { label: "Håndbok", color: "bg-red-100 text-red-800" },
    RECORD: { label: "Protokoll", color: "bg-gray-100 text-gray-800" },
    EXTERNAL: { label: "Eksternt", color: "bg-orange-100 text-orange-800" },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Utkast", color: "bg-gray-100 text-gray-800" },
    REVIEW: { label: "Til godkjenning", color: "bg-yellow-100 text-yellow-800" },
    APPROVED: { label: "Godkjent", color: "bg-green-100 text-green-800" },
    EFFECTIVE: { label: "Aktiv", color: "bg-blue-100 text-blue-800" },
    SUPERSEDED: { label: "Erstattet", color: "bg-orange-100 text-orange-800" },
    ARCHIVED: { label: "Arkivert", color: "bg-red-100 text-red-800" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dokumenthåndtering</h1>
          <p className="text-muted-foreground mt-2">
            Prosedyrer, instrukser og andre QMS-dokumenter (ISO 7.5)
          </p>
        </div>
        <QmsDocumentDialog users={users} />
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-sm text-muted-foreground">Utkast</p>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Til godkjenning</p>
              <p className="text-2xl font-bold">{stats.review}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Aktive</p>
              <p className="text-2xl font-bold">{stats.effective}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Totalt</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabell */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Dok.nr</th>
                <th className="p-4 text-left font-medium">Tittel</th>
                <th className="p-4 text-left font-medium">Kategori</th>
                <th className="p-4 text-left font-medium">Versjon</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Eier</th>
                <th className="p-4 text-left font-medium">Gyldig fra</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Ingen dokumenter funnet
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <Link
                        href={`/admin/kvalitet/dokumenter/${doc.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {doc.documentNo}
                      </Link>
                    </td>
                    <td className="p-4 max-w-xs truncate">{doc.title}</td>
                    <td className="p-4">
                      <Badge
                        className={categoryConfig[doc.category].color}
                        variant="outline"
                      >
                        {categoryConfig[doc.category].label}
                      </Badge>
                    </td>
                    <td className="p-4">{doc.version}</td>
                    <td className="p-4">
                      <Badge
                        className={statusConfig[doc.status].color}
                        variant="outline"
                      >
                        {statusConfig[doc.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">{doc.owner.name}</td>
                    <td className="p-4">
                      {doc.effectiveDate ? (
                        format(new Date(doc.effectiveDate), "dd.MM.yyyy", {
                          locale: nb,
                        })
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

