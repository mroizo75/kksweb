"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Download, Users, Loader2, Plus, Trash2 } from "lucide-react";
import { bulkEnrollParticipants } from "@/app/actions/enrollment/bulkEnroll";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

type Course = {
  id: string;
  title: string;
  sessions: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    location: string | null;
    capacity: number;
    _count?: {
      enrollments: number;
    };
  }[];
};

type Company = {
  id: string;
  name: string;
  orgNo: string | null;
};

type Props = {
  courses: Course[];
  companies: Company[];
};

const bulkEnrollSchema = z.object({
  sessionId: z.string().min(1, "Sesjon må velges"),
  companyId: z.string().optional(),
});

type BulkEnrollInput = z.infer<typeof bulkEnrollSchema>;

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
};

export function BulkEnrollmentClient({ courses, companies }: Props) {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [csvText, setCsvText] = useState("");

  const form = useForm<BulkEnrollInput>({
    resolver: zodResolver(bulkEnrollSchema),
    defaultValues: {
      sessionId: "",
      companyId: "NONE",
    },
  });

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);
  const selectedSession = selectedCourseData?.sessions.find(
    (s) => s.id === form.watch("sessionId")
  );

  // Helper function to format date range
  const formatSessionDate = (session: any) => {
    const start = new Date(session.startsAt);
    const end = new Date(session.endsAt);
    
    if (start.toDateString() === end.toDateString()) {
      return format(start, "EEEE d. MMMM yyyy", { locale: nb });
    }
    
    return `${format(start, "d. MMM", { locale: nb })} - ${format(end, "d. MMM yyyy", { locale: nb })}`;
  };

  // Helper to get week number
  const getWeekNumber = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  };

  // Generer eksempel CSV
  const generateExampleCSV = () => {
    const csv = `firstName,lastName,email,phone,birthDate
Ole,Hansen,ole.hansen@bedrift.no,12345678,1990-01-15
Kari,Johansen,kari.johansen@bedrift.no,87654321,1985-05-22
Per,Olsen,per.olsen@bedrift.no,11223344,1992-11-30`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eksempel-deltakere.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Eksempel-fil lastet ned");
  };

  // Parse CSV
  const parseCSV = () => {
    if (!csvText.trim()) {
      toast.error("Lim inn CSV-data først");
      return;
    }

    try {
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      // Sjekk at nødvendige kolonner finnes
      const requiredHeaders = ["firstName", "lastName", "email"];
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast.error(`Mangler kolonner: ${missingHeaders.join(", ")}`);
        return;
      }

      const newParticipants: Participant[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        
        if (values.length === 0 || !values[0]) continue;

        const participant: any = {};
        headers.forEach((header, index) => {
          participant[header] = values[index] || "";
        });

        newParticipants.push({
          id: `new-${Date.now()}-${i}`,
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
          phone: participant.phone || "",
          birthDate: participant.birthDate || "",
        });
      }

      setParticipants([...participants, ...newParticipants]);
      setCsvText("");
      toast.success(`${newParticipants.length} deltakere lagt til`);
    } catch (error) {
      console.error("CSV parse error:", error);
      toast.error("Kunne ikke parse CSV. Sjekk formatet.");
    }
  };

  // Legg til manuelt
  const addManualParticipant = () => {
    const newParticipant: Participant = {
      id: `new-${Date.now()}`,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
    };
    setParticipants([...participants, newParticipant]);
  };

  // Fjern deltaker
  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  // Oppdater deltaker
  const updateParticipant = (id: string, field: keyof Participant, value: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Send inn påmeldinger
  const onSubmit = async (data: BulkEnrollInput) => {
    if (participants.length === 0) {
      toast.error("Legg til minst én deltaker");
      return;
    }

    // Valider at alle deltakere har nødvendig info
    const invalidParticipants = participants.filter(
      (p) => !p.firstName || !p.lastName || !p.email
    );

    if (invalidParticipants.length > 0) {
      toast.error(
        `${invalidParticipants.length} deltaker(e) mangler fornavn, etternavn eller e-post`
      );
      return;
    }

    setLoading(true);

    try {
      const result = await bulkEnrollParticipants({
        sessionId: data.sessionId,
        companyId: data.companyId === "NONE" ? undefined : data.companyId,
        participants: participants.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          birthDate: p.birthDate,
        })),
      });

      if (result.success) {
        toast.success(result.message || "Alle deltakere påmeldt!");
        setParticipants([]);
        form.reset();
        setSelectedCourse("");
      } else {
        toast.error(result.error || "Noe gikk galt");
      }
    } catch (error) {
      console.error("Bulk enroll error:", error);
      toast.error("Kunne ikke melde på deltakere");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Velg sesjon */}
      <Card>
        <CardHeader>
          <CardTitle>1. Velg kurs og sesjon</CardTitle>
          <CardDescription>
            Velg hvilken kurssesjon deltakerne skal meldes på
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              {/* Steg 1: Velg kurs */}
              <div className="space-y-2">
                <Label>1. Velg kurs *</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedCourse(value);
                    form.setValue("sessionId", ""); // Reset session når kurs endres
                  }}
                  value={selectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kurs" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                        {course.sessions.length > 0 && (
                          <span className="text-muted-foreground ml-2">
                            ({course.sessions.length} sesjon{course.sessions.length !== 1 ? "er" : ""})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Steg 2: Velg sesjon (vises kun når kurs er valgt) */}
              {selectedCourse && selectedCourseData && (
                <FormField
                  control={form.control}
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. Velg sesjon/dato *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg dato/uke" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {selectedCourseData.sessions.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                              Ingen åpne sesjoner for dette kurset
                            </div>
                          ) : (
                            selectedCourseData.sessions.map((session) => {
                              const weekNo = getWeekNumber(new Date(session.startsAt));
                              const currentEnrollments = session._count?.enrollments || 0;
                              const spotsLeft = session.capacity - currentEnrollments;
                              
                              return (
                                <SelectItem key={session.id} value={session.id}>
                                  <div className="flex flex-col">
                                    <div className="font-medium">
                                      Uke {weekNo} - {formatSessionDate(session)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {session.location || "Sted ikke angitt"} • {currentEnrollments}/{session.capacity} påmeldt
                                      {spotsLeft < 5 && spotsLeft > 0 && (
                                        <span className="text-orange-600 dark:text-orange-400 ml-1">
                                          (kun {spotsLeft} plasser igjen)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Velg hvilken uke/dato deltakerne skal meldes på
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrift (valgfritt)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "NONE" ? undefined : value)}
                      value={field.value || "NONE"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg bedrift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="NONE">Ingen bedrift</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                            {company.orgNo && ` (${company.orgNo})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Knytt alle deltakere til en bedrift
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedSession && selectedCourseData && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Valgt sesjon:
                      </p>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        {selectedCourseData.title}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Uke {getWeekNumber(new Date(selectedSession.startsAt))} - {formatSessionDate(selectedSession)}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        📍 {selectedSession.location || "Sted ikke angitt"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white dark:bg-gray-900">
                      {selectedSession._count?.enrollments || 0} / {selectedSession.capacity} påmeldt
                    </Badge>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Legg til deltakere */}
      <Card>
        <CardHeader>
          <CardTitle>2. Legg til deltakere</CardTitle>
          <CardDescription>
            Importer fra CSV eller legg til manuelt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="csv" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv">CSV-import</TabsTrigger>
              <TabsTrigger value="manual">Manuell input</TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="space-y-4">
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateExampleCSV}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Last ned eksempel CSV
                </Button>
                <p className="text-sm text-muted-foreground">
                  Format: firstName, lastName, email, phone, birthDate (YYYY-MM-DD)
                </p>
              </div>

              <Textarea
                placeholder="Lim inn CSV-data her...&#10;firstName,lastName,email,phone,birthDate&#10;Ole,Hansen,ole@bedrift.no,12345678,1990-01-15"
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />

              <Button type="button" onClick={parseCSV} className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Importer fra CSV
              </Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <Button
                type="button"
                onClick={addManualParticipant}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Legg til deltaker
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Deltakerliste */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>3. Bekreft deltakere</CardTitle>
                <CardDescription>
                  {participants.length} deltaker(e) klar for påmelding
                </CardDescription>
              </div>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading || !form.watch("sessionId")}
                size="lg"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Users className="h-4 w-4 mr-2" />
                Meld på alle ({participants.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornavn</TableHead>
                    <TableHead>Etternavn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Fødselsdato</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <Input
                          value={participant.firstName}
                          onChange={(e) =>
                            updateParticipant(participant.id, "firstName", e.target.value)
                          }
                          placeholder="Fornavn"
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={participant.lastName}
                          onChange={(e) =>
                            updateParticipant(participant.id, "lastName", e.target.value)
                          }
                          placeholder="Etternavn"
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="email"
                          value={participant.email}
                          onChange={(e) =>
                            updateParticipant(participant.id, "email", e.target.value)
                          }
                          placeholder="epost@eksempel.no"
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={participant.phone}
                          onChange={(e) =>
                            updateParticipant(participant.id, "phone", e.target.value)
                          }
                          placeholder="12345678"
                          className="min-w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={participant.birthDate}
                          onChange={(e) =>
                            updateParticipant(participant.id, "birthDate", e.target.value)
                          }
                          className="min-w-[140px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

