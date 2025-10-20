"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnrollmentDetailsDialog } from "@/components/admin/EnrollmentDetailsDialog";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { Enrollment, Person, Company, CourseSession, Course } from "@prisma/client";

interface EnrollmentWithRelations extends Enrollment {
  person: Person;
  company: Company | null;
  session: CourseSession & {
    course: Course;
  };
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "default",
  WAITLIST: "secondary",
  ATTENDED: "default",
  NO_SHOW: "destructive",
  CANCELLED: "destructive",
};

const statusText: Record<string, string> = {
  PENDING: "Venter",
  CONFIRMED: "Bekreftet",
  WAITLIST: "Venteliste",
  ATTENDED: "Deltok",
  NO_SHOW: "Møtte ikke",
  CANCELLED: "Avlyst",
};

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithRelations[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<EnrollmentWithRelations[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithRelations | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = enrollments.filter((enrollment) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          enrollment.person.firstName.toLowerCase().includes(searchLower) ||
          enrollment.person.lastName.toLowerCase().includes(searchLower) ||
          (enrollment.person.email || "").toLowerCase().includes(searchLower) ||
          enrollment.session.course.title.toLowerCase().includes(searchLower) ||
          (enrollment.company?.name || "").toLowerCase().includes(searchLower)
        );
      });
      setFilteredEnrollments(filtered);
    } else {
      setFilteredEnrollments(enrollments);
    }
  }, [searchTerm, enrollments]);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("/api/admin/enrollments");
      const data = await res.json();
      setEnrollments(data.enrollments || []);
      setFilteredEnrollments(data.enrollments || []);
    } catch (error) {
      console.error("Feil ved henting av påmeldinger:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (enrollment: EnrollmentWithRelations) => {
    setSelectedEnrollment(enrollment);
    setDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedEnrollment(null);
      fetchEnrollments(); // Oppdater listen
    }
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Påmeldinger</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Oversikt over alle kurspåmeldinger
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Manuell påmelding
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Alle påmeldinger</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søk..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Laster...</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Deltaker</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Kurs</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Dato</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Bedrift</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Status</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Påmeldt</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b last:border-0">
                      <td className="py-3 px-2 sm:px-4">
                        <div>
                          <p className="font-medium text-xs sm:text-sm">
                            {enrollment.person.firstName} {enrollment.person.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {enrollment.person.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <p className="font-medium text-xs sm:text-sm">{enrollment.session.course.title}</p>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <p className="text-xs">
                          {format(new Date(enrollment.session.startsAt), "dd.MM.yyyy", { locale: nb })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {enrollment.session.location}
                        </p>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        {enrollment.company ? (
                          <p className="text-xs">{enrollment.company.name}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Privatperson</p>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <Badge variant={statusColors[enrollment.status]} className="text-xs">
                          {statusText[enrollment.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(enrollment.createdAt), "dd.MM.yyyy", { locale: nb })}
                        </p>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetails(enrollment)}
                          className="text-xs"
                        >
                          Detaljer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredEnrollments.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Ingen påmeldinger funnet" : "Ingen påmeldinger ennå"}
            </p>
          )}
        </CardContent>
      </Card>

      <EnrollmentDetailsDialog
        enrollment={selectedEnrollment}
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
      />
    </div>
  );
}
