import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssessmentDialog } from "@/components/admin/AssessmentDialog";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle } from "lucide-react";

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sessionId?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const sessionId = params.sessionId;

  // Fetch sessions for filter
  const sessions = await db.courseSession.findMany({
    where: {
      status: { in: ["OPEN", "FULL", "COMPLETED"] },
    },
    include: {
      course: true,
    },
    orderBy: { startsAt: "desc" },
    take: 50,
  });

  // Fetch assessments
  const assessments = await db.assessment.findMany({
    where: {
      AND: [
        sessionId ? { sessionId } : {},
        search
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
          ],
        }
      : {},
      ],
    },
    include: {
      person: true,
      course: true,
      session: {
        include: {
          course: true,
        },
      },
    },
    orderBy: { attendanceTime: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vurdering</h1>
          <p className="text-muted-foreground">
            Administrer oppmøte, resultater og vurderinger
          </p>
        </div>
        <AssessmentDialog sessions={sessions} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <form className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Søk etter person eller kurs..."
              defaultValue={search}
              className="pl-10"
            />
          </div>
          <select
            name="sessionId"
            defaultValue={sessionId || ""}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Alle sesjoner</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.course.title} - {new Date(session.startsAt).toLocaleDateString("nb-NO")}
              </option>
            ))}
          </select>
          <Button type="submit">Filtrer</Button>
        </form>
      </div>

      {/* Assessments Table */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Person</th>
                <th className="text-left p-4 font-medium">Kurs</th>
                <th className="text-left p-4 font-medium">Sesjon</th>
                <th className="text-left p-4 font-medium">Oppmøte</th>
                <th className="text-left p-4 font-medium">Bestått</th>
                <th className="text-left p-4 font-medium">Poengsum</th>
                <th className="text-left p-4 font-medium">Vurdert av</th>
                <th className="text-left p-4 font-medium">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">
                    Ingen vurderinger funnet
                  </td>
                </tr>
              ) : (
                assessments.map((assessment) => (
                  <tr key={assessment.id} className="border-t hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">
                          {assessment.person.firstName} {assessment.person.lastName}
                        </div>
                        {assessment.person.email && (
                          <div className="text-sm text-muted-foreground">
                            {assessment.person.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{assessment.course.title}</td>
                    <td className="p-4">
                      {new Date(assessment.session.startsAt).toLocaleDateString("nb-NO")}
                    </td>
                    <td className="p-4">
                      {assessment.attended ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Møtt
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Ikke møtt
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {assessment.passed !== null ? (
                        assessment.passed ? (
                          <Badge variant="default">Bestått</Badge>
                        ) : (
                          <Badge variant="destructive">Ikke bestått</Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {assessment.score !== null ? (
                        <span className="font-medium">{assessment.score}%</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">{assessment.assessedBy || "-"}</td>
                    <td className="p-4">
                      <AssessmentDialog
                        sessions={sessions}
                        existingAssessment={assessment}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Totalt vurderinger</h3>
          <p className="text-2xl font-bold">{assessments.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-green-600">Møtt opp</h3>
          <p className="text-2xl font-bold">
            {assessments.filter((a) => a.attended).length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-blue-600">Bestått</h3>
          <p className="text-2xl font-bold">
            {assessments.filter((a) => a.passed === true).length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Gjennomsnittsscore</h3>
          <p className="text-2xl font-bold">
            {assessments.filter((a) => a.score !== null).length > 0
              ? Math.round(
                  assessments
                    .filter((a) => a.score !== null)
                    .reduce((sum, a) => sum + (a.score || 0), 0) /
                    assessments.filter((a) => a.score !== null).length
                )
              : 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
}

