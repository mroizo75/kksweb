"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { SessionDialog } from "@/components/admin/SessionDialog";
import { deleteSession } from "@/app/actions/createSession";
import { toast } from "sonner";
import type { CourseSession, Course, User } from "@prisma/client";

type SessionWithRelations = CourseSession & {
  course: Course;
  instructor: Pick<User, "name"> | null;
  _count: { enrollments: number };
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionWithRelations[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CourseSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/sessions");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error("Kunne ikke laste sesjoner");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleEdit = (session: CourseSession) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedSession(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne sesjonen?")) return;

    const result = await deleteSession(id);
    if (result.success) {
      toast.success("Sesjon slettet");
      loadSessions();
    } else {
      toast.error(result.error || "Kunne ikke slette sesjon");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadSessions();
    }
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline",
    OPEN: "default",
    FULL: "destructive",
    COMPLETED: "secondary",
    CANCELLED: "destructive",
  };

  const statusText: Record<string, string> = {
    DRAFT: "Utkast",
    OPEN: "Åpen",
    FULL: "Full",
    COMPLETED: "Fullført",
    CANCELLED: "Avlyst",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sesjoner</h1>
          <p className="text-muted-foreground">
            Administrer kursesjoner og datoer
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Opprett sesjon
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laster sesjoner...</p>
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Ingen sesjoner opprettet ennå
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Opprett din første sesjon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Kommende sesjoner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => {
                const enrolledCount = session._count.enrollments;
                const availableSpots = session.capacity - enrolledCount;
                const fillPercentage = (enrolledCount / session.capacity) * 100;

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{session.course.title}</p>
                        <Badge variant={statusColors[session.status]}>
                          {statusText[session.status]}
                        </Badge>
                      </div>
                      <div className="ml-7 space-y-1 text-sm text-muted-foreground">
                        <p>
                          {format(new Date(session.startsAt), "EEEE d. MMMM yyyy 'kl.' HH:mm", {
                            locale: nb,
                          })}
                        </p>
                        <p>{session.location}</p>
                        {session.instructor && (
                          <p>Instruktør: {session.instructor.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge
                          variant={fillPercentage >= 100 ? "destructive" : fillPercentage >= 80 ? "secondary" : "default"}
                        >
                          {enrolledCount}/{session.capacity} påmeldt
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {availableSpots > 0 ? `${availableSpots} ${availableSpots === 1 ? "plass" : "plasser"} ledig` : "Fullt"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(session)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <SessionDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        session={selectedSession}
      />
    </div>
  );
}
