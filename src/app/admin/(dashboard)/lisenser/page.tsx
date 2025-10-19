import { Suspense } from "react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AlertTriangle, CheckCircle2, Clock, XCircle, Shield } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ClientActions } from "./client-actions";

interface SearchParams {
  search?: string;
  status?: string;
}

export default async function LisensePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params?.search || "";
  const statusFilter = params?.status || "ALL";

  // Hent lisenser med bedriftsinformasjon
  const licenses = await db.license.findMany({
    where: {
      ...(statusFilter && statusFilter !== "ALL" && { status: statusFilter as any }),
      ...(search && {
        company: {
          OR: [
            { name: { contains: search } },
            { orgNo: { contains: search } },
            { email: { contains: search } },
          ],
        },
      }),
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          orgNo: true,
          email: true,
          phone: true,
          _count: {
            select: {
              people: true,
              enrollments: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Statistikk
  const stats = {
    total: licenses.length,
    active: licenses.filter((l) => l.status === "ACTIVE").length,
    trial: licenses.filter((l) => l.status === "TRIAL").length,
    suspended: licenses.filter((l) => l.status === "SUSPENDED").length,
    expired: licenses.filter((l) => l.status === "EXPIRED").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lisenser</h1>
          <p className="text-muted-foreground">
            Administrer bedriftslisenser og tilgangskontroll
          </p>
        </div>
        <ClientActions type="create" />
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Totalt
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Aktive
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-blue-600" />
            Trial
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600">{stats.trial}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Suspendert
          </div>
          <div className="mt-2 text-2xl font-bold text-yellow-600">{stats.suspended}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4 text-red-600" />
            Utløpt
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{stats.expired}</div>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex gap-4">
        <div className="flex-1">
          <form>
            <Input
              name="search"
              placeholder="Søk etter bedrift (navn, org.nr, e-post)..."
              defaultValue={search}
            />
          </form>
        </div>
        <div className="w-48">
          <form>
            <Select name="status" defaultValue={statusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Alle statuser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle statuser</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="ACTIVE">Aktiv</SelectItem>
                <SelectItem value="SUSPENDED">Suspendert</SelectItem>
                <SelectItem value="EXPIRED">Utløpt</SelectItem>
                <SelectItem value="CANCELLED">Kansellert</SelectItem>
              </SelectContent>
            </Select>
          </form>
        </div>
      </div>

      {/* Tabell */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bedrift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Brukere</TableHead>
              <TableHead>Påmeldinger</TableHead>
              <TableHead>Pris</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Ingen lisenser funnet
                </TableCell>
              </TableRow>
            ) : (
              licenses.map((license) => {
                const daysUntilExpiry = Math.ceil(
                  (new Date(license.endDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                return (
                  <TableRow key={license.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{license.company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {license.company.orgNo || "Ingen org.nr"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          license.status === "ACTIVE"
                            ? "default"
                            : license.status === "TRIAL"
                            ? "secondary"
                            : license.status === "SUSPENDED"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {license.status === "ACTIVE"
                          ? "Aktiv"
                          : license.status === "TRIAL"
                          ? "Trial"
                          : license.status === "SUSPENDED"
                          ? "Suspendert"
                          : license.status === "EXPIRED"
                          ? "Utløpt"
                          : "Kansellert"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {format(new Date(license.startDate), "dd.MM.yyyy", { locale: nb })} -{" "}
                          {format(new Date(license.endDate), "dd.MM.yyyy", { locale: nb })}
                        </div>
                        {isExpiringSoon && (
                          <div className="text-yellow-600">
                            ⚠️ Utløper om {daysUntilExpiry} dager
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {license.company._count.people}
                        {license.maxUsers && ` / ${license.maxUsers}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {license.company._count.enrollments}
                        {license.maxEnrollments && ` / ${license.maxEnrollments}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {license.monthlyPrice
                          ? `${license.monthlyPrice} kr/mnd`
                          : license.annualPrice
                          ? `${license.annualPrice} kr/år`
                          : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ClientActions
                        type="manage"
                        license={license}
                        companyId={license.companyId}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

