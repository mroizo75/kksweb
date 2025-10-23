import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage(props: PageProps) {
  const params = await props.params;
  const course = await db.course.findUnique({
    where: { slug: params.slug },
    include: {
      sessions: {
        where: {
          startsAt: { gte: new Date() },
          status: { in: ["OPEN", "DRAFT"] },
        },
        orderBy: { startsAt: "asc" },
        include: {
          instructor: {
            select: { name: true },
          },
          _count: {
            select: {
              enrollments: {
                where: {
                  status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/kurs" className="inline-flex items-center text-sm hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til alle kurs
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            {course.image && (
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-auto object-cover max-h-[400px]"
                />
              </div>
            )}

            <div className="mb-4">
              <Badge variant="secondary" className="mb-4">
                {course.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground">
                Kurskode: {course.code}
              </p>
            </div>

            <div className="flex items-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {course.durationDays} {course.durationDays === 1 ? "dag" : "dager"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {course.price === 0
                    ? "Gratis"
                    : `${course.price.toLocaleString("nb-NO")} kr`}
                </span>
              </div>
            </div>

            {course.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Om kurset</h2>
                <div className="prose prose-gray max-w-none dark:prose-invert">
                  {course.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-muted-foreground mb-4 leading-relaxed">
                      {paragraph.split('\n').map((line, lineIdx) => (
                        <span key={lineIdx}>
                          {line}
                          {lineIdx < paragraph.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Hva du lærer</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Grunnleggende sikkerhetsprosedyrer</li>
                <li>Praktisk opplæring med erfarne instruktører</li>
                <li>Teoretisk og praktisk eksamen</li>
                <li>Offisielt kursbevis ved bestått</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Hvem bør ta kurset</h2>
              <p className="text-muted-foreground">
                Dette kurset passer for deg som skal jobbe med eller allerede jobber med
                relevante oppgaver i din arbeidshverdag.
              </p>
            </div>
          </div>

          {/* Sidebar - Sessions */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Kommende kurs</CardTitle>
                <CardDescription>
                  Velg en dato som passer for deg
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ingen kommende kursdatoer er planlagt for øyeblikket.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {course.sessions.map((session) => {
                      const availableSpots =
                        session.capacity - session._count.enrollments;
                      const isFull = availableSpots <= 0;

                      return (
                        <Card key={session.id}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">
                                      {format(session.startsAt, "EEEE d. MMMM", {
                                        locale: nb,
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {format(session.startsAt, "HH:mm", { locale: nb })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{session.location}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4" />
                                <Badge
                                  variant={
                                    availableSpots > 5 ? "default" : "destructive"
                                  }
                                >
                                  {isFull
                                    ? "Fullt"
                                    : `${availableSpots} ${availableSpots === 1 ? "plass" : "plasser"}`}
                                </Badge>
                              </div>

                              {session.instructor && (
                                <p className="text-sm text-muted-foreground">
                                  Instruktør: {session.instructor.name}
                                </p>
                              )}

                              <Link
                                href={`/kurs/${course.slug}/pamelding/${session.id}`}
                                className="block mt-4"
                              >
                                <Button
                                  className="w-full"
                                  disabled={isFull}
                                  variant={isFull ? "outline" : "default"}
                                >
                                  {isFull ? "Fullt booket" : "Meld deg på"}
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

