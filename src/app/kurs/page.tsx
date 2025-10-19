import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function CoursesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { category, search } = searchParams;

  const courses = await db.course.findMany({
    where: {
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { code: { contains: search } },
        ],
      }),
      published: true,
    },
    include: {
      sessions: {
        where: {
          startsAt: { gte: new Date() },
          status: { in: ["OPEN"] },
        },
        orderBy: { startsAt: "asc" },
        take: 1,
        include: {
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
    orderBy: { title: "asc" },
  });

  const categories = await db.course.findMany({
    where: { published: true },
    select: { category: true },
    distinct: ["category"],
  });

  const uniqueCategories = categories.map((c) => c.category);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Alle kurs</h1>
          <p className="text-lg text-muted-foreground">
            Finn og meld deg på kurs som passer for deg
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/kurs">
            <Button variant={!category ? "default" : "outline"} size="sm">
              Alle
            </Button>
          </Link>
          {uniqueCategories.map((cat) => (
            <Link key={cat} href={`/kurs?category=${cat}`}>
              <Button
                variant={category === cat ? "default" : "outline"}
                size="sm"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            </Link>
          ))}
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Ingen kurs funnet. Prøv en annen kategori.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const nextSession = course.sessions[0];
              const availableSpots = nextSession
                ? nextSession.capacity - nextSession._count.enrollments
                : 0;

              return (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{course.category}</Badge>
                      <span className="text-sm font-bold text-primary">
                        {course.price === 0
                          ? "Gratis"
                          : `${course.price.toLocaleString("nb-NO")} kr`}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description || "Ingen beskrivelse"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {course.durationDays}{" "}
                          {course.durationDays === 1 ? "dag" : "dager"}
                        </span>
                      </div>

                      {nextSession && (
                        <>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Neste: {format(nextSession.startsAt, "d. MMM yyyy", { locale: nb })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{nextSession.location}</span>
                          </div>
                          <div className="mt-4">
                            <Badge
                              variant={availableSpots > 5 ? "default" : "destructive"}
                            >
                              {availableSpots > 0
                                ? `${availableSpots} ${availableSpots === 1 ? "plass" : "plasser"} ledig`
                                : "Fullt booket"}
                            </Badge>
                          </div>
                        </>
                      )}

                      {!nextSession && (
                        <p className="text-muted-foreground italic">
                          Ingen kommende kurs planlagt
                        </p>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link href={`/kurs/${course.slug}`} className="w-full">
                      <Button className="w-full">
                        Se detaljer og meld på
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

