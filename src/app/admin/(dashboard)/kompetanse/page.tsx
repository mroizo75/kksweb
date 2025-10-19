import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CredentialDialog } from "@/components/admin/CredentialDialog";
import { Badge } from "@/components/ui/badge";
import { getCredentialStatus } from "@/lib/validity";
import Link from "next/link";
import { Search, Download, CheckCircle, AlertCircle, Clock, User } from "lucide-react";
import Image from "next/image";

export default async function CredentialsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";

  const credentials = await db.credential.findMany({
    where: search
      ? {
          OR: [
            {
              person: {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { email: { contains: search } },
                ],
              },
            },
            { course: { title: { contains: search } } },
            { code: { contains: search } },
          ],
        }
      : undefined,
    include: {
      person: true,
      course: true,
      policy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kompetansebevis</h1>
          <p className="text-muted-foreground">
            Administrer utstedte kompetansebevis og dokumenter
          </p>
        </div>
        <CredentialDialog />
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Søk etter person, kurs eller bevis-kode..."
            defaultValue={search}
            className="pl-10"
          />
        </div>
        <Button type="submit">Søk</Button>
      </form>

      {/* Credentials Table */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Bilde</th>
                <th className="text-left p-4 font-medium">Person</th>
                <th className="text-left p-4 font-medium">Kontakt</th>
                <th className="text-left p-4 font-medium">Kurs</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Koder</th>
                <th className="text-left p-4 font-medium">Gyldig til</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {credentials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-muted-foreground">
                    Ingen kompetansebevis funnet
                  </td>
                </tr>
              ) : (
                credentials.map((credential) => {
                  const status = getCredentialStatus(
                    credential.validTo,
                    credential.policy?.graceDays ?? undefined
                  );
                  const statusConfig = {
                    valid: {
                      label: "Gyldig",
                      variant: "default" as const,
                      icon: CheckCircle,
                    },
                    expired: {
                      label: "Utløpt",
                      variant: "destructive" as const,
                      icon: AlertCircle,
                    },
                    expiring_soon: {
                      label: "Utløper snart",
                      variant: "secondary" as const,
                      icon: Clock,
                    },
                  };

                  const statusInfo = statusConfig[status];
                  const StatusIcon = statusInfo.icon;

                  // Parse competence codes
                  const codes = Array.isArray(credential.competenceCodes) 
                    ? credential.competenceCodes 
                    : [];

                  return (
                    <tr key={credential.id} className="border-t hover:bg-muted/50">
                      <td className="p-4">
                        {credential.person.profileImage ? (
                          <Image
                            src={credential.person.profileImage}
                            alt={`${credential.person.firstName} ${credential.person.lastName}`}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {credential.person.firstName} {credential.person.lastName}
                          </div>
                          {credential.person.birthDate && (
                            <div className="text-xs text-muted-foreground">
                              Født: {new Date(credential.person.birthDate).toLocaleDateString("nb-NO")}
                            </div>
                          )}
                          <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded mt-1 inline-block">
                            {credential.code}
                          </code>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {credential.person.email && (
                            <div className="text-muted-foreground">{credential.person.email}</div>
                          )}
                          {credential.person.phone && (
                            <div className="text-muted-foreground">{credential.person.phone}</div>
                          )}
                          {credential.person.address && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {credential.person.address}
                              {credential.person.postalCode && `, ${credential.person.postalCode}`}
                              {credential.person.city && ` ${credential.person.city}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{credential.course.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Utstedt: {new Date(credential.validFrom).toLocaleDateString("nb-NO")}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={credential.type === "CERTIFIED" ? "default" : "secondary"}>
                          {credential.type === "CERTIFIED" ? "Sertifisert" : credential.type === "TEMPORARY" ? "Midlertidig" : "Dokumentert"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {codes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {codes.map((code) => (
                              <Badge key={String(code)} variant="outline" className="text-xs">
                                {String(code)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {credential.validTo
                          ? new Date(credential.validTo).toLocaleDateString("nb-NO")
                          : <span className="text-muted-foreground">Ingen utløp</span>}
                      </td>
                      <td className="p-4">
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/verify/${credential.code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              Vis
                            </Button>
                          </Link>
                          <form action="/api/admin/documents/generate" method="POST">
                            <input type="hidden" name="credentialId" value={credential.id} />
                            <input type="hidden" name="kind" value="DIPLOMA" />
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <Download className="h-3 w-3" />
                              PDF
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-semibold">Gyldige</h3>
          </div>
          <p className="text-2xl font-bold">
            {credentials.filter((c) => getCredentialStatus(c.validTo, c.policy?.graceDays ?? undefined) === "valid").length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold">Utløper snart</h3>
          </div>
          <p className="text-2xl font-bold">
            {credentials.filter((c) => getCredentialStatus(c.validTo, c.policy?.graceDays ?? undefined) === "expiring_soon").length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Utløpte</h3>
          </div>
          <p className="text-2xl font-bold">
            {credentials.filter((c) => getCredentialStatus(c.validTo, c.policy?.graceDays ?? undefined) === "expired").length}
          </p>
        </div>
      </div>
    </div>
  );
}

