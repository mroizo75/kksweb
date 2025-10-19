import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { DocumentActions } from "./client-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const document = await db.qmsDocument.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      acknowledgments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          acknowledgedAt: "desc",
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

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
        <div className="flex items-center gap-4">
          <Link href="/admin/kvalitet/dokumenter">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Tilbake</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{document.documentNo}</h1>
            <p className="text-muted-foreground mt-1">{document.title}</p>
          </div>
        </div>
        <DocumentActions document={document} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hovedinnhold */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dokumentdetaljer */}
          <Card>
            <CardHeader>
              <CardTitle>Dokumentinformasjon</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">
                    Dokumentnummer
                  </p>
                  <p className="text-lg font-semibold">{document.documentNo}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Versjon</p>
                  <p className="text-lg font-semibold">{document.version}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Kategori</p>
                  <Badge className={categoryConfig[document.category].color}>
                    {categoryConfig[document.category].label}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <Badge className={statusConfig[document.status].color}>
                    {statusConfig[document.status].label}
                  </Badge>
                </div>
              </div>

              {document.description && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">
                    Beskrivelse
                  </p>
                  <p className="text-sm">{document.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">
                    Dokumenteier
                  </p>
                  <p>{document.owner.name || document.owner.email}</p>
                </div>
                {document.approver && (
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Godkjent av
                    </p>
                    <p>{document.approver.name || document.approver.email}</p>
                    {document.approvedAt && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(document.approvedAt), "dd.MM.yyyy", {
                          locale: nb,
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {document.effectiveDate && (
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Gyldig fra
                    </p>
                    <p>
                      {format(
                        new Date(document.effectiveDate),
                        "dd.MM.yyyy",
                        { locale: nb }
                      )}
                    </p>
                  </div>
                )}
                {document.reviewDate && (
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Neste revisjon
                    </p>
                    <p>
                      {format(new Date(document.reviewDate), "dd.MM.yyyy", {
                        locale: nb,
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-medium text-muted-foreground mb-2">Fil</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/files/${document.fileKey}`} target="_blank">
                    <Download className="mr-2 h-4 w-4" />
                    Last ned dokument
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lesebekreftelser */}
          <Card>
            <CardHeader>
              <CardTitle>Lesebekreftelser</CardTitle>
              <CardDescription>
                {document.acknowledgments.length} person(er) har bekreftet lesing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {document.acknowledgments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Ingen lesebekreftelser ennå
                </p>
              ) : (
                <div className="space-y-2">
                  {document.acknowledgments.map((ack) => (
                    <div
                      key={ack.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {ack.user.name || ack.user.email}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ack.acknowledgedAt), "dd.MM.yyyy HH:mm", {
                          locale: nb,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidepanel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Opprettet av</p>
                <p>{document.creator.name || document.creator.email}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(document.createdAt), "dd.MM.yyyy HH:mm", {
                    locale: nb,
                  })}
                </p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">
                  Sist oppdatert
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(document.updatedAt), "dd.MM.yyyy HH:mm", {
                    locale: nb,
                  })}
                </p>
              </div>

              {document.archivedAt && (
                <div>
                  <p className="font-medium text-muted-foreground">Arkivert</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(document.archivedAt), "dd.MM.yyyy", {
                      locale: nb,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Godkjenningsflyt */}
          <Card>
            <CardHeader>
              <CardTitle>Godkjenningsflyt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      document.status === "DRAFT"
                        ? "bg-gray-500"
                        : "bg-green-500"
                    }`}
                  />
                  <p className="text-sm">Utkast</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      document.status === "REVIEW"
                        ? "bg-yellow-500"
                        : document.status === "APPROVED" ||
                          document.status === "EFFECTIVE"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <p className="text-sm">Til godkjenning</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      document.status === "APPROVED"
                        ? "bg-green-500"
                        : document.status === "EFFECTIVE"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <p className="text-sm">Godkjent</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      document.status === "EFFECTIVE"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <p className="text-sm">Aktiv</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

