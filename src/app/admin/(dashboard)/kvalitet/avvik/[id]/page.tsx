import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { EditButton, NewActionButton, StatusButton } from "./client-actions";
import { getAllowedStatusTransitions } from "@/lib/qms-utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NonConformanceDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Hent avvik med alle relasjoner
  const nc = await db.qmsNonConformance.findUnique({
    where: { id },
    include: {
      reporter: {
        select: { id: true, name: true, email: true },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
      verifier: {
        select: { id: true, name: true, email: true },
      },
      closer: {
        select: { id: true, name: true, email: true },
      },
      company: {
        select: { id: true, name: true },
      },
      person: {
        select: { id: true, firstName: true, lastName: true },
      },
      course: {
        select: { id: true, title: true, code: true },
      },
      session: {
        select: { id: true, startsAt: true, location: true },
      },
      correctiveActions: {
        include: {
          responsible: {
            select: { id: true, name: true, email: true },
          },
          verifier: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!nc) {
    notFound();
  }

  // Hent brukere for dialogen
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  // Få tillatte statusendringer
  const allowedTransitions = getAllowedStatusTransitions(
    nc.status,
    nc.severity,
    nc.correctiveActions.length > 0
  );

  // Konfigurasjon
  const typeConfig: Record<string, { label: string; color: string }> = {
    INTERNAL: { label: "Intern", color: "bg-blue-100 text-blue-800" },
    EXTERNAL: { label: "Ekstern", color: "bg-purple-100 text-purple-800" },
    CUSTOMER: { label: "Kunde", color: "bg-red-100 text-red-800" },
    SUPPLIER: { label: "Leverandør", color: "bg-orange-100 text-orange-800" },
    AUDIT: { label: "Revisjon", color: "bg-yellow-100 text-yellow-800" },
    REGULATORY: { label: "Myndighetskrav", color: "bg-pink-100 text-pink-800" },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    OPEN: { label: "Åpen", color: "bg-red-100 text-red-800" },
    INVESTIGATING: { label: "Under undersøkelse", color: "bg-yellow-100 text-yellow-800" },
    ACTION: { label: "Tiltak iverksatt", color: "bg-blue-100 text-blue-800" },
    VERIFICATION: { label: "Til verifisering", color: "bg-purple-100 text-purple-800" },
    CLOSED: { label: "Lukket", color: "bg-green-100 text-green-800" },
    REJECTED: { label: "Avvist", color: "bg-gray-100 text-gray-800" },
  };

  const severityConfig: Record<string, { label: string; color: string }> = {
    CRITICAL: { label: "Kritisk", color: "bg-red-100 text-red-800" },
    MAJOR: { label: "Alvorlig", color: "bg-orange-100 text-orange-800" },
    MINOR: { label: "Mindre alvorlig", color: "bg-yellow-100 text-yellow-800" },
    OBSERVATION: { label: "Observasjon", color: "bg-blue-100 text-blue-800" },
  };

  const categoryConfig: Record<string, string> = {
    PROCESS: "Prosess",
    PRODUCT: "Produkt/tjeneste",
    DOCUMENTATION: "Dokumentasjon",
    EQUIPMENT: "Utstyr",
    PERSONNEL: "Personell/kompetanse",
    ENVIRONMENT: "Miljø/HMS",
    OTHER: "Annet",
  };

  const actionTypeConfig: Record<string, string> = {
    IMMEDIATE: "Umiddelbar handling",
    CORRECTIVE: "Korrigerende tiltak",
    PREVENTIVE: "Forebyggende tiltak",
  };

  const actionStatusConfig: Record<string, { label: string; color: string }> = {
    PLANNED: { label: "Planlagt", color: "bg-gray-100 text-gray-800" },
    IN_PROGRESS: { label: "Pågår", color: "bg-blue-100 text-blue-800" },
    COMPLETED: { label: "Fullført", color: "bg-green-100 text-green-800" },
    VERIFIED: { label: "Verifisert", color: "bg-purple-100 text-purple-800" },
    OVERDUE: { label: "Forfalt", color: "bg-red-100 text-red-800" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/kvalitet/avvik">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{nc.ncNumber}</h1>
            <p className="text-muted-foreground mt-1">{nc.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusButton
            ncId={nc.id}
            currentStatus={nc.status}
            severity={nc.severity}
            hasCorrectiveActions={nc.correctiveActions.length > 0}
            allowedTransitions={allowedTransitions}
          />
          <EditButton />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hovedinnhold */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detaljer */}
          <Card>
            <CardHeader>
              <CardTitle>Avviksdetaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={typeConfig[nc.type].color} variant="outline">
                  {typeConfig[nc.type].label}
                </Badge>
                <Badge className={severityConfig[nc.severity].color} variant="outline">
                  {severityConfig[nc.severity].label}
                </Badge>
                <Badge className={statusConfig[nc.status].color} variant="outline">
                  {statusConfig[nc.status].label}
                </Badge>
                <Badge variant="outline">
                  {categoryConfig[nc.category]}
                </Badge>
                <Badge variant="outline">
                  Prioritet: {nc.priority === 1 ? "Høy" : nc.priority === 2 ? "Medium" : "Lav"}
                </Badge>
              </div>

              {/* Beskrivelse */}
              <div>
                <h3 className="font-semibold mb-2">Beskrivelse</h3>
                <p className="text-sm whitespace-pre-wrap">{nc.description}</p>
              </div>

              {/* Årsaksanalyse */}
              {nc.rootCause && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Årsaksanalyse
                    {nc.rootCauseMethod && ` (${nc.rootCauseMethod === "5_WHY" ? "5 Why" : nc.rootCauseMethod})`}
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{nc.rootCause}</p>
                </div>
              )}

              {/* Lokasjon */}
              {nc.location && (
                <div>
                  <h3 className="font-semibold mb-2">Lokasjon</h3>
                  <p className="text-sm">{nc.location}</p>
                </div>
              )}

              {/* Relasjoner */}
              {(nc.company || nc.person || nc.course || nc.session) && (
                <div>
                  <h3 className="font-semibold mb-2">Relatert til</h3>
                  <div className="space-y-1 text-sm">
                    {nc.company && (
                      <p><strong>Bedrift:</strong> {nc.company.name}</p>
                    )}
                    {nc.person && (
                      <p><strong>Person:</strong> {nc.person.firstName} {nc.person.lastName}</p>
                    )}
                    {nc.course && (
                      <p><strong>Kurs:</strong> {nc.course.title} ({nc.course.code})</p>
                    )}
                    {nc.session && (
                      <p>
                        <strong>Sesjon:</strong> {format(new Date(nc.session.startsAt), "dd.MM.yyyy HH:mm", { locale: nb })} - {nc.session.location}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Korrigerende tiltak */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Korrigerende tiltak</CardTitle>
                  <CardDescription>
                    {nc.correctiveActions.length} tiltak registrert
                  </CardDescription>
                </div>
                <NewActionButton ncId={nc.id} users={users} />
              </div>
            </CardHeader>
            <CardContent>
              {nc.correctiveActions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Ingen korrigerende tiltak registrert ennå
                </p>
              ) : (
                <div className="space-y-4">
                  {nc.correctiveActions.map((action) => (
                    <div key={action.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{action.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline">
                          {actionTypeConfig[action.actionType]}
                        </Badge>
                        <Badge className={actionStatusConfig[action.status].color} variant="outline">
                          {actionStatusConfig[action.status].label}
                        </Badge>
                        <Badge variant="outline">
                          Ansvarlig: {action.responsible.name}
                        </Badge>
                        <Badge variant="outline">
                          Frist: {format(new Date(action.dueDate), "dd.MM.yyyy", { locale: nb })}
                        </Badge>
                      </div>
                      {action.effectiveness && (
                        <div className="mt-3 text-sm">
                          <strong>Effektivitet:</strong> {action.effectiveness}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Metadata */}
        <div className="space-y-6">
          {/* Datoer */}
          <Card>
            <CardHeader>
              <CardTitle>Tidslinje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Oppdaget</p>
                <p className="font-medium">
                  {format(new Date(nc.detectedAt), "dd.MM.yyyy HH:mm", { locale: nb })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Opprettet</p>
                <p className="font-medium">
                  {format(new Date(nc.createdAt), "dd.MM.yyyy HH:mm", { locale: nb })}
                </p>
              </div>
              {nc.dueDate && (
                <div>
                  <p className="text-muted-foreground">Forfallsdato</p>
                  <p className="font-medium">
                    {format(new Date(nc.dueDate), "dd.MM.yyyy", { locale: nb })}
                  </p>
                </div>
              )}
              {nc.closedAt && (
                <div>
                  <p className="text-muted-foreground">Lukket</p>
                  <p className="font-medium">
                    {format(new Date(nc.closedAt), "dd.MM.yyyy HH:mm", { locale: nb })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ansvarlige */}
          <Card>
            <CardHeader>
              <CardTitle>Ansvarlige</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Rapportert av</p>
                <p className="font-medium">{nc.reporter.name || nc.reporter.email}</p>
              </div>
              {nc.assignee && (
                <div>
                  <p className="text-muted-foreground">Tildelt til</p>
                  <p className="font-medium">{nc.assignee.name || nc.assignee.email}</p>
                </div>
              )}
              {nc.verifier && (
                <div>
                  <p className="text-muted-foreground">Verifisert av</p>
                  <p className="font-medium">{nc.verifier.name || nc.verifier.email}</p>
                </div>
              )}
              {nc.closer && (
                <div>
                  <p className="text-muted-foreground">Lukket av</p>
                  <p className="font-medium">{nc.closer.name || nc.closer.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

