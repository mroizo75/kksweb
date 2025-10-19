import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Download, FileText, Award, User, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export const metadata = {
  title: "Min side | KKS AS",
  description: "Se dine kurspåmeldinger og kompetansebevis",
};

async function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    PENDING: { label: "Venter", variant: "secondary" },
    CONFIRMED: { label: "Bekreftet", variant: "default" },
    COMPLETED: { label: "Fullført", variant: "outline" },
    CANCELLED: { label: "Avbrutt", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

async function MinSidePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/min-side/logg-inn");
  }

  // Finn person basert på e-post
  const person = await db.person.findFirst({
    where: { email: session.user.email },
    include: {
      company: true,
      enrollments: {
        include: {
          session: {
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      credentials: {
        include: {
          course: true,
          policy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!person) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Ingen data funnet</CardTitle>
              <CardDescription>
                Vi finner ingen kursinformasjon knyttet til din e-post. Kontakt oss hvis dette er feil.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Hent dokumenter via enrollments
  const allDocuments = person.enrollments.flatMap((e) => e.session.course).length;

  // Separer aktive og historiske påmeldinger
  const activeEnrollments = person.enrollments.filter(
    (e) => e.status === "CONFIRMED" && new Date(e.session.startsAt) > new Date()
  );

  const historyEnrollments = person.enrollments.filter(
    (e) => new Date(e.session.startsAt) <= new Date()
  );

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Velkommen */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Hei, {person.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Velkommen til din kursportal
            </p>
          </div>
          <Link href="/min-side/profil">
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Min profil
            </Button>
          </Link>
        </div>

        {/* Statistikk */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Kommende kurs
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEnrollments.length}</div>
              <p className="text-xs text-muted-foreground">
                påmeldte sesjoner
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Kompetansebevis
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{person.credentials.length}</div>
              <p className="text-xs text-muted-foreground">
                utstedte bevis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fullførte kurs
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{historyEnrollments.length}</div>
              <p className="text-xs text-muted-foreground">
                gjennomførte kurs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Kommende ({activeEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Historikk ({historyEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="credentials">
              Kompetansebevis ({person.credentials.length})
            </TabsTrigger>
          </TabsList>

          {/* Kommende kurs */}
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Kommende kurspåmeldinger</CardTitle>
                <CardDescription>
                  Kurs du er påmeldt fremover i tid
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeEnrollments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Du har ingen kommende kurspåmeldinger</p>
                    <Link href="/kurs">
                      <Button className="mt-4">Se tilgjengelige kurs</Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kurs</TableHead>
                        <TableHead>Dato</TableHead>
                        <TableHead>Sted</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.session.course.title}
                          </TableCell>
                          <TableCell>
                            {format(new Date(enrollment.session.startsAt), "PPP", { locale: nb })}
                          </TableCell>
                          <TableCell>{enrollment.session.location}</TableCell>
                          <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historikk */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Kurshistorikk</CardTitle>
                <CardDescription>
                  Tidligere gjennomførte kurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyEnrollments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ingen kurshistorikk ennå</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kurs</TableHead>
                        <TableHead>Dato</TableHead>
                        <TableHead>Sted</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.session.course.title}
                          </TableCell>
                          <TableCell>
                            {format(new Date(enrollment.session.startsAt), "PPP", { locale: nb })}
                          </TableCell>
                          <TableCell>{enrollment.session.location}</TableCell>
                          <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kompetansebevis */}
          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle>Mine kompetansebevis</CardTitle>
                <CardDescription>
                  Utstedte kompetansebevis og sertifikater
                </CardDescription>
              </CardHeader>
              <CardContent>
                {person.credentials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ingen kompetansebevis utstedt ennå</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {person.credentials.map((credential) => {
                      const isValid = credential.validTo ? new Date(credential.validTo) > new Date() : true;
                      return (
                        <div
                          key={credential.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${isValid ? "bg-green-100 dark:bg-green-900" : "bg-orange-100 dark:bg-orange-900"}`}>
                              {isValid ? (
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              ) : (
                                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{credential.course.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Utstedt: {format(new Date(credential.createdAt), "PPP", { locale: nb })}
                              </p>
                              {credential.validTo && (
                                <p className="text-sm text-muted-foreground">
                                  {isValid ? "Gyldig til" : "Utløpt"}: {format(new Date(credential.validTo), "PPP", { locale: nb })}
                                </p>
                              )}
                              <Badge variant={isValid ? "default" : "destructive"} className="mt-2">
                                {isValid ? "Gyldig" : "Utgått"}
                              </Badge>
                            </div>
                          </div>
                          <Link href={`/verify/${credential.code}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Verifiser
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default MinSidePage;

