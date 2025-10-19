import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Calendar, User } from "lucide-react";
import { notFound } from "next/navigation";
import { addDays } from "date-fns";

interface VerifyTempPageProps {
  params: Promise<{ enrollmentId: string }>;
}

export async function generateMetadata({ params }: VerifyTempPageProps) {
  const { enrollmentId } = await params;

  return {
    title: `Verifiser midlertidig bevis - ${enrollmentId}`,
    description: "Verifiser et midlertidig kursbevis fra KKS AS",
  };
}

export default async function VerifyTempPage({ params }: VerifyTempPageProps) {
  const { enrollmentId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      person: true,
      session: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!enrollment) {
    notFound();
  }

  // Beregn gyldighet (14 dager fra opprettelse)
  const validTo = addDays(new Date(enrollment.createdAt), 14);
  const isValid = new Date() <= validTo;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Midlertidig Kursbevis</h1>
            <p className="text-gray-600">KKS AS</p>
          </div>

          {/* Status */}
          <div className="flex justify-center mb-8">
            {isValid ? (
              <Badge className="text-lg px-6 py-2 bg-orange-500 hover:bg-orange-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                Gyldig midlertidig bevis
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-lg px-6 py-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                Utløpt
              </Badge>
            )}
          </div>

          {/* Advarsel */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
            <p className="text-sm text-orange-800">
              <strong>OBS:</strong> Dette er et midlertidig bevis gyldig i 14 dager. 
              Permanent kompetansebevis vil bli utstedt etter gjennomført kurs.
            </p>
          </div>

          {/* Person Info */}
          <div className="space-y-4 mb-6">
            <div className="border-b pb-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Deltaker</span>
              </div>
              <p className="text-xl font-semibold">
                {enrollment.person.firstName} {enrollment.person.lastName}
              </p>
              {enrollment.person.birthDate && (
                <p className="text-sm text-gray-600">
                  Født: {new Date(enrollment.person.birthDate).toLocaleDateString("nb-NO")}
                </p>
              )}
            </div>

            <div className="border-b pb-4">
              <div className="text-sm text-gray-600 mb-2">Kurs</div>
              <p className="text-lg font-semibold">{enrollment.session.course.title}</p>
            </div>

            <div className="border-b pb-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Fullført</span>
              </div>
              <p className="font-medium">
                {new Date(enrollment.session.startsAt).toLocaleDateString("nb-NO")}
              </p>
            </div>

            <div className="border-b pb-4">
              <div className="text-sm text-gray-600 mb-2">Gyldighetsperiode</div>
              <p className="font-medium text-orange-600">
                {new Date(enrollment.createdAt).toLocaleDateString("nb-NO")} -{" "}
                {validTo.toLocaleDateString("nb-NO")}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isValid ? "Gyldig i 14 dager fra utstedelse" : "Beviset har utløpt"}
              </p>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">Verifiseringskode</div>
              <code className="bg-gray-100 px-3 py-2 rounded font-mono text-sm">
                {enrollmentId.substring(0, 12).toUpperCase()}
              </code>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t">
            <p className="text-sm text-gray-500">
              Verifisert: {new Date().toLocaleDateString("nb-NO")} kl.{" "}
              {new Date().toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Info boks */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Om midlertidig bevis</h3>
          <p className="text-sm text-gray-700">
            Et midlertidig bevis utstedes umiddelbart etter påmelding og er gyldig i 14 dager. 
            Dette gir deltakeren dokumentasjon mens permanent kompetansebevis behandles og utstedes.
          </p>
        </div>
      </div>
    </div>
  );
}

