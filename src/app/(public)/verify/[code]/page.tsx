import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Calendar, User, Award } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { getCredentialStatus, isCredentialValid } from "@/lib/validity";
import { notFound } from "next/navigation";

interface VerifyPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { code } = await params;

  // Hent credential fra database
  const credential = await db.credential.findUnique({
    where: { code },
    include: {
      person: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          title: true,
          code: true,
          category: true,
          durationDays: true,
        },
      },
      policy: true,
    },
  });

  if (!credential) {
    notFound();
  }

  // Beregn status
  const graceDays = credential.policy?.graceDays || 0;
  const status = getCredentialStatus(credential.validTo, graceDays);
  const isValid = isCredentialValid(credential.validTo, graceDays);

  // Status-styling
  const statusConfig = {
    valid: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-800",
      label: "Gyldig",
    },
    expiring_soon: {
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      badge: "bg-yellow-100 text-yellow-800",
      label: "Utløper snart",
    },
    expired: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      badge: "bg-red-100 text-red-800",
      label: "Utløpt",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Kompetansebevis Verifisering
          </h1>
          <p className="text-gray-600">
            Offentlig verifikasjon av kompetanse og sertifiseringer
          </p>
        </div>

        {/* Status Card */}
        <Card className={`mb-6 ${config.border} border-2`}>
          <CardHeader className={config.bg}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon className={`h-8 w-8 ${config.color}`} />
                <div>
                  <CardTitle>Status: {config.label}</CardTitle>
                  <CardDescription>
                    {status === "valid" && "Dette kompetansebeviset er gyldig"}
                    {status === "expiring_soon" && "Dette kompetansebeviset utløper snart"}
                    {status === "expired" && "Dette kompetansebeviset er utløpt"}
                  </CardDescription>
                </div>
              </div>
              <Badge className={config.badge}>{config.label.toUpperCase()}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Kompetansebevis Detaljer</CardTitle>
            <CardDescription>Bekreftet informasjon fra KKS AS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Person */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Innehaver</p>
                <p className="text-lg font-semibold text-gray-900">
                  {credential.person.firstName} {credential.person.lastName}
                </p>
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Kurs</p>
                <p className="text-lg font-semibold text-gray-900">
                  {credential.course.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Kode: {credential.course.code}
                  </Badge>
                  <Badge variant="outline">
                    Kategori: {credential.course.category}
                  </Badge>
                  <Badge variant="outline">
                    Varighet: {credential.course.durationDays} dag(er)
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Gyldighetsperiode</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Gyldig fra:</span>{" "}
                    {format(new Date(credential.validFrom), "dd. MMMM yyyy", { locale: nb })}
                  </p>
                  {credential.validTo ? (
                    <p className="text-sm">
                      <span className="font-medium">Gyldig til:</span>{" "}
                      <span className={status === "expired" ? "text-red-600 font-semibold" : ""}>
                        {format(new Date(credential.validTo), "dd. MMMM yyyy", { locale: nb })}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 font-medium">
                      Ingen utløpsdato - gyldig på ubestemt tid
                    </p>
                  )}
                  {credential.policy?.graceDays && credential.policy.graceDays > 0 && (
                    <p className="text-xs text-gray-500">
                      Grace period: {credential.policy.graceDays} dager etter utløp
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Credential Code */}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 mb-1">Bevis-ID</p>
              <p className="font-mono text-sm text-gray-700">{credential.code}</p>
            </div>

            {/* Verification Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                ℹ️ Dette er en offentlig verifikasjon utstedt av KKS AS.
                Informasjonen er hentet direkte fra vårt sertifiseringsregister og er
                bekreftet autentisk.
              </p>
            </div>

            {/* Warning for expired */}
            {status === "expired" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900 font-medium">
                  ⚠️ ADVARSEL: Dette kompetansebeviset er utløpt og er ikke lenger gyldig.
                </p>
                {credential.policy?.renewalCourseId && (
                  <p className="text-sm text-red-800 mt-2">
                    Kontakt KKS AS for oppfriskning eller fornyelse.
                  </p>
                )}
              </div>
            )}

            {/* Warning for expiring soon */}
            {status === "expiring_soon" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  ⏰ Dette kompetansebeviset utløper snart. Vi anbefaler å fornye
                  kompetansen i god tid før utløpsdato.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Verifisert:{" "}
            {format(new Date(), "dd. MMMM yyyy 'kl.' HH:mm", { locale: nb })}
          </p>
          <p className="mt-2">
            <a
              href="/"
              className="text-blue-600 hover:underline"
            >
              Tilbake til KKS AS
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: VerifyPageProps) {
  const { code } = await params;
  const credential = await db.credential.findUnique({
    where: { code },
    include: {
      person: { select: { firstName: true, lastName: true } },
      course: { select: { title: true } },
    },
  });

  if (!credential) {
    return {
      title: "Kompetansebevis ikke funnet",
    };
  }

  return {
    title: `Verifisering: ${credential.person.firstName} ${credential.person.lastName} - ${credential.course.title}`,
    description: `Offentlig verifisering av kompetansebevis utstedt av KKS AS`,
  };
}

