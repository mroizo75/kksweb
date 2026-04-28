"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Calendar as CalendarIcon, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight,
} from "lucide-react";
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

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline", OPEN: "default", FULL: "destructive",
  COMPLETED: "secondary", CANCELLED: "destructive",
};
const STATUS_TEXT: Record<string, string> = {
  DRAFT: "Utkast", OPEN: "Åpen", FULL: "Full",
  COMPLETED: "Fullført", CANCELLED: "Avlyst",
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CourseSession | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
        status: statusFilter,
        period,
      });
      const response = await fetch(`/api/admin/sessions?${params}`);
      const data = await response.json();
      setSessions(data.sessions ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Kunne ikke laste sesjoner");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, period]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Reset til side 1 ved filterendring
  useEffect(() => { setPage(1); }, [search, statusFilter, period]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

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
    if (result.success) { toast.success("Sesjon slettet"); loadSessions(); }
    else toast.error(result.error || "Kunne ikke slette sesjon");
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) loadSessions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Sesjoner</h1>
          <p className="text-muted-foreground">Administrer kursesjoner og datoer</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Opprett sesjon
        </Button>
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Søk på kurs, sted eller instruktør..."
            className="pl-9"
          />
        </form>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statuser</SelectItem>
            {Object.entries(STATUS_TEXT).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border overflow-hidden text-sm">
          {(["upcoming", "all", "past"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {p === "upcoming" ? "Kommende" : p === "all" ? "Alle" : "Tidligere"}
            </button>
          ))}
        </div>
        {!isLoading && (
          <span className="text-sm text-muted-foreground ml-auto">
            {total} sesjon{total !== 1 ? "er" : ""}
          </span>
        )}
      </div>

      {/* Innhold */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Laster sesjoner...</div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground mb-4">
              {total === 0 && !search && statusFilter === "all"
                ? "Ingen sesjoner opprettet ennå"
                : "Ingen sesjoner matcher søket"}
            </p>
            {total === 0 && !search && statusFilter === "all" && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> Opprett din første sesjon
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {period === "upcoming" ? "Kommende sesjoner" : period === "past" ? "Tidligere sesjoner" : "Alle sesjoner"}
            </CardTitle>
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
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="font-medium truncate">{session.course.title}</p>
                        <Badge variant={STATUS_COLORS[session.status]}>
                          {STATUS_TEXT[session.status]}
                        </Badge>
                      </div>
                      <div className="ml-7 space-y-1 text-sm text-muted-foreground">
                        <p>
                          {format(new Date(session.startsAt), "EEEE d. MMMM yyyy 'kl.' HH:mm", { locale: nb })}
                        </p>
                        {session.location && <p>{session.location}</p>}
                        {session.instructor && <p>Instruktør: {session.instructor.name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <Badge
                          variant={
                            fillPercentage >= 100 ? "destructive"
                              : fillPercentage >= 80 ? "secondary"
                              : "default"
                          }
                        >
                          {enrolledCount}/{session.capacity} påmeldt
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {availableSpots > 0
                            ? `${availableSpots} ${availableSpots === 1 ? "plass" : "plasser"} ledig`
                            : "Fullt"}
                        </p>
                      </div>
                      <div className="flex gap-1">
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

      {/* Paginering */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Side {page} av {totalPages} · {total} sesjoner
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Forrige
            </Button>

            {/* Sidetall */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className="w-9 h-9"
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Neste
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <SessionDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        session={selectedSession}
      />
    </div>
  );
}
