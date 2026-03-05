"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Award,
} from "lucide-react";
import { sendDiplomas } from "@/app/actions/documents/sendDiplomas";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface Enrollment {
  person: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  };
}

interface CourseSession {
  id: string;
  startsAt: string;
  location: string;
  course: { id: string; title: string; code: string };
  enrollments: Enrollment[];
}

interface Participant {
  id: string;
  name: string;
  email: string;
  selected: boolean;
}

interface DiplomaDialogProps {
  templateId: string;
  templateName: string;
}

type SendResult = {
  sent: number;
  failed: number;
  errors: { name: string; email: string; error: string }[];
};

export function DiplomaDialog({ templateId, templateName }: DiplomaDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"kurs" | "manuell">("kurs");
  const [isPending, startTransition] = useTransition();

  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [completedDate, setCompletedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [manualCourseName, setManualCourseName] = useState("");
  const [instructorOverride, setInstructorOverride] = useState("");
  const [kursParticipants, setKursParticipants] = useState<Participant[]>([]);
  const [manualParticipants, setManualParticipants] = useState<Participant[]>([
    { id: "m1", name: "", email: "", selected: true },
  ]);

  const [result, setResult] = useState<SendResult | null>(null);
  const [sent, setSent] = useState(false);

  const activeParticipants =
    tab === "kurs"
      ? kursParticipants.filter((p) => p.selected)
      : manualParticipants.filter(
          (p) => p.selected && p.name.trim() && p.email.trim()
        );

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const courseName = selectedSession?.course.title ?? "";

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && sessions.length === 0) {
      fetchSessions();
    }
    if (!isOpen) {
      resetState();
    }
  }

  function resetState() {
    setSelectedSessionId("");
    setKursParticipants([]);
    setManualCourseName("");
    setInstructorOverride("");
    setManualParticipants([{ id: "m1", name: "", email: "", selected: true }]);
    setResult(null);
    setSent(false);
    setTab("kurs");
  }

  async function fetchSessions() {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/admin/sessions/for-diploma");
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } finally {
      setLoadingSessions(false);
    }
  }

  function handleSessionChange(sessionId: string) {
    setSelectedSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const participants: Participant[] = session.enrollments.map((e) => ({
      id: e.person.id,
      name: `${e.person.firstName} ${e.person.lastName}`,
      email: e.person.email ?? "",
      selected: true,
    }));
    setKursParticipants(participants);
  }

  function toggleKursParticipant(id: string) {
    setKursParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  }

  function updateKursEmail(id: string, email: string) {
    setKursParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, email } : p))
    );
  }

  function addManualParticipant() {
    setManualParticipants((prev) => [
      ...prev,
      { id: `m${Date.now()}`, name: "", email: "", selected: true },
    ]);
  }

  function removeManualParticipant(id: string) {
    setManualParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  function updateManual(id: string, field: "name" | "email", value: string) {
    setManualParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  function handleSend() {
    const finalCourseName = tab === "kurs" ? courseName : manualCourseName;

    startTransition(async () => {
      const res = await sendDiplomas({
        templateId,
        courseName: finalCourseName,
        completedDate,
        instructorOverride: instructorOverride.trim() || undefined,
        participants: activeParticipants.map((p) => ({
          name: p.name,
          email: p.email,
        })),
      });

      setResult({
        sent: res.sent,
        failed: res.failed,
        errors: res.errors,
      });
      setSent(true);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1">
          <Send className="h-3 w-3" />
          Send diplomer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Send diplomer – {templateName}
          </DialogTitle>
        </DialogHeader>

        {sent && result ? (
          <SendResultView
            result={result}
            onClose={() => setOpen(false)}
            onReset={resetState}
          />
        ) : (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="completedDate">Fullføringsdato</Label>
                <Input
                  id="completedDate"
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instructorOverride">Instruktør (overstyring)</Label>
                <Input
                  id="instructorOverride"
                  value={instructorOverride}
                  onChange={(e) => setInstructorOverride(e.target.value)}
                  placeholder="Hentes fra mal hvis tom"
                />
              </div>
            </div>

            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "kurs" | "manuell")}
            >
              <TabsList className="w-full">
                <TabsTrigger value="kurs" className="flex-1">
                  Fra kurs
                </TabsTrigger>
                <TabsTrigger value="manuell" className="flex-1">
                  Manuell
                </TabsTrigger>
              </TabsList>

              <TabsContent value="kurs" className="space-y-4 mt-4">
                <div>
                  <Label>Velg kurs/sesjon</Label>
                  {loadingSessions ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Henter sesjoner...
                    </div>
                  ) : (
                    <Select
                      value={selectedSessionId}
                      onValueChange={handleSessionChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Velg sesjon..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            Ingen sesjoner funnet
                          </SelectItem>
                        ) : (
                          sessions.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.course.title} –{" "}
                              {format(new Date(s.startsAt), "dd.MM.yyyy", {
                                locale: nb,
                              })}{" "}
                              ({s.location})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {kursParticipants.length > 0 && (
                  <div className="space-y-2">
                    <Label>
                      Deltakere ({kursParticipants.filter((p) => p.selected).length}{" "}
                      valgt)
                    </Label>
                    <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                      {kursParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <Checkbox
                            checked={p.selected}
                            onCheckedChange={() =>
                              toggleKursParticipant(p.id)
                            }
                          />
                          <span className="flex-1 text-sm font-medium">
                            {p.name}
                          </span>
                          <Input
                            value={p.email}
                            onChange={(e) =>
                              updateKursEmail(p.id, e.target.value)
                            }
                            placeholder="E-post"
                            className="w-48 h-7 text-xs"
                          />
                          {!p.email && (
                            <Badge variant="destructive" className="text-xs">
                              Mangler e-post
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSessionId && kursParticipants.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                    Ingen bekreftede deltakere på denne sesjonen
                  </p>
                )}
              </TabsContent>

              <TabsContent value="manuell" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="manualCourse">Kursnavn</Label>
                  <Input
                    id="manualCourse"
                    value={manualCourseName}
                    onChange={(e) => setManualCourseName(e.target.value)}
                    placeholder="F.eks. Grunnkurs i brannvern"
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deltakere</Label>
                  {manualParticipants.map((p, i) => (
                    <div key={p.id} className="flex gap-2 items-center">
                      <Input
                        value={p.name}
                        onChange={(e) =>
                          updateManual(p.id, "name", e.target.value)
                        }
                        placeholder={`Deltaker ${i + 1} – Navn`}
                        className="flex-1"
                      />
                      <Input
                        value={p.email}
                        onChange={(e) =>
                          updateManual(p.id, "email", e.target.value)
                        }
                        placeholder="E-post"
                        className="flex-1"
                        type="email"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeManualParticipant(p.id)}
                        disabled={manualParticipants.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addManualParticipant}
                    className="gap-1 mt-1"
                  >
                    <Plus className="h-3 w-3" />
                    Legg til deltaker
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {activeParticipants.length} diplom(er) klar til sending
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isPending || activeParticipants.length === 0}
                  className="gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sender...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send {activeParticipants.length > 0
                        ? `${activeParticipants.length} diplom(er)`
                        : "diplomer"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SendResultView({
  result,
  onClose,
  onReset,
}: {
  result: SendResult;
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <div className="py-4 space-y-4">
      {result.sent > 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-green-800 font-medium">
            {result.sent} diplom(er) sendt!
          </p>
        </div>
      )}

      {result.failed > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-800 font-medium">
              {result.failed} diplom(er) feilet
            </p>
          </div>
          <div className="border rounded-lg divide-y">
            {result.errors.map((e, i) => (
              <div key={i} className="px-3 py-2 text-sm">
                <span className="font-medium">{e.name}</span>
                {e.email && (
                  <span className="text-muted-foreground"> ({e.email})</span>
                )}
                <span className="text-red-600 ml-2">– {e.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {result.failed > 0 && (
          <Button variant="outline" onClick={onReset}>
            Send på nytt
          </Button>
        )}
        <Button onClick={onClose}>Lukk</Button>
      </div>
    </div>
  );
}
