"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Building2, X } from "lucide-react";
import { bulkEnrollParticipants } from "@/app/actions/enrollment/bulkEnroll";
import { createCompany } from "@/app/actions/admin/companies";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

const participantSchema = z.object({
  firstName: z.string().min(2, "Fornavn må være minst 2 tegn"),
  lastName: z.string().min(2, "Etternavn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
});

const manualEnrollSchema = z.object({
  courseId: z.string().min(1, "Velg et kurs"),
  sessionId: z.string().min(1, "Velg en sesjon"),
  companyId: z.string().optional(),
  participants: z.array(participantSchema).min(1, "Legg til minst én deltaker"),
});

type ManualEnrollInput = z.infer<typeof manualEnrollSchema>;

type SessionOption = {
  id: string;
  startsAt: Date;
  location: string | null;
  capacity: number;
  enrollmentCount: number;
};

type CourseOption = {
  id: string;
  title: string;
  sessions: SessionOption[];
};

type CompanyOption = {
  id: string;
  name: string;
};

interface ManualEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ManualEnrollmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: ManualEnrollmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyOrgNo, setNewCompanyOrgNo] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newCompanyAddress, setNewCompanyAddress] = useState("");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [availableSessions, setAvailableSessions] = useState<SessionOption[]>([]);

  const form = useForm<ManualEnrollInput>({
    resolver: zodResolver(manualEnrollSchema),
    defaultValues: {
      courseId: "",
      sessionId: "",
      companyId: "",
      participants: [{ firstName: "", lastName: "", email: "", phone: "", birthDate: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  useEffect(() => {
    if (!open) return;
    fetchCourses();
    fetchCompanies();
    form.reset({
      courseId: "",
      sessionId: "",
      companyId: "",
      participants: [{ firstName: "", lastName: "", email: "", phone: "", birthDate: "" }],
    });
    setAvailableSessions([]);
    setShowNewCompanyForm(false);
    setNewCompanyName("");
    setNewCompanyOrgNo("");
    setNewCompanyEmail("");
    setNewCompanyAddress("");
  }, [open, form]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses/sessions");
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch {
      toast.error("Kunne ikke hente kurs");
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies");
      const data = await res.json();
      setCompanies(data.companies ?? []);
    } catch {
      // selvstendig, bedrift er valgfritt
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      toast.error("Bedriftsnavn er påkrevd");
      return;
    }
    if (!newCompanyOrgNo.trim() || !/^\d{9}$/.test(newCompanyOrgNo.trim())) {
      toast.error("Org.nr må være 9 siffer");
      return;
    }
    if (!newCompanyEmail.trim()) {
      toast.error("E-post til faktura/kontakt er påkrevd");
      return;
    }
    setIsCreatingCompany(true);
    try {
      const result = await createCompany({
        name: newCompanyName.trim(),
        orgNo: newCompanyOrgNo.trim(),
        email: newCompanyEmail.trim(),
        address: newCompanyAddress.trim() || undefined,
      });
      if (!result.success || !result.company) {
        toast.error(result.error ?? "Kunne ikke opprette bedrift");
        return;
      }
      const created = { id: result.company.id, name: result.company.name };
      setCompanies((prev) => [...prev, created]);
      form.setValue("companyId", created.id);
      setShowNewCompanyForm(false);
      setNewCompanyName("");
      setNewCompanyOrgNo("");
      setNewCompanyEmail("");
      setNewCompanyAddress("");
      toast.success(`Bedrift "${created.name}" opprettet og valgt`);
    } catch {
      toast.error("Noe gikk galt");
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleCourseChange = (courseId: string) => {
    form.setValue("courseId", courseId);
    form.setValue("sessionId", "");
    const course = courses.find((c) => c.id === courseId);
    setAvailableSessions(course?.sessions ?? []);
  };

  const onSubmit = async (data: ManualEnrollInput) => {
    setIsSubmitting(true);
    try {
      const result = await bulkEnrollParticipants({
        sessionId: data.sessionId,
        companyId: data.companyId && data.companyId !== "none" ? data.companyId : undefined,
        participants: data.participants.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone || undefined,
          birthDate: p.birthDate || undefined,
        })),
      });

      if (result.success) {
        toast.success(result.message ?? "Påmelding fullført");
        if (result.failures && result.failures.length > 0) {
          result.failures.forEach((f) =>
            toast.warning(`${f.email}: ${f.reason}`)
          );
        }
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Påmelding feilet");
      }
    } catch {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manuell påmelding</DialogTitle>
          <DialogDescription>
            Meld på en eller flere deltakere på et kurs
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Kursvalg */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kurs</FormLabel>
                  <Select
                    onValueChange={handleCourseChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg kurs" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sesjonvalg */}
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sesjon / dato</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={availableSessions.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            availableSessions.length === 0
                              ? "Velg kurs først"
                              : "Velg dato"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSessions.map((s) => {
                        const available = s.capacity - s.enrollmentCount;
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            {format(new Date(s.startsAt), "EEEE d. MMMM yyyy", { locale: nb })}
                            {s.location ? ` — ${s.location}` : ""}
                            {` (${available} plasser)`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bedrift (valgfritt) */}
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Bedrift (valgfritt)</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto py-0 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewCompanyForm((v) => !v)}
                    >
                      {showNewCompanyForm ? (
                        <><X className="mr-1 h-3 w-3" />Avbryt</>
                      ) : (
                        <><Building2 className="mr-1 h-3 w-3" />Ny bedrift</>
                      )}
                    </Button>
                  </div>

                  {showNewCompanyForm ? (
                    <div className="rounded-md border p-3 space-y-2 bg-muted/40">
                      <p className="text-xs font-medium text-muted-foreground">Opprett ny bedrift</p>
                      <Input
                        placeholder="Bedriftsnavn *"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                      />
                      <Input
                        placeholder="Org.nr (9 siffer) *"
                        value={newCompanyOrgNo}
                        onChange={(e) => setNewCompanyOrgNo(e.target.value.replace(/\D/g, ""))}
                        maxLength={9}
                        inputMode="numeric"
                      />
                      <Input
                        type="email"
                        placeholder="Faktura / kontakt-epost *"
                        value={newCompanyEmail}
                        onChange={(e) => setNewCompanyEmail(e.target.value)}
                      />
                      <Input
                        placeholder="Adresse (valgfritt)"
                        value={newCompanyAddress}
                        onChange={(e) => setNewCompanyAddress(e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={isCreatingCompany || !newCompanyName.trim()}
                        onClick={handleCreateCompany}
                        className="w-full"
                      >
                        {isCreatingCompany ? (
                          <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Oppretter...</>
                        ) : (
                          "Opprett og velg bedrift"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Privatperson / ingen bedrift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Ingen bedrift</SelectItem>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deltakere */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-base font-medium">Deltakere</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ firstName: "", lastName: "", email: "", phone: "", birthDate: "" })
                  }
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Legg til
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-md border p-3 space-y-3 relative"
                >
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <p className="text-xs font-medium text-muted-foreground">
                    Deltaker {index + 1}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`participants.${index}.firstName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Fornavn *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ola" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`participants.${index}.lastName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Etternavn *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nordmann" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`participants.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">E-post *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="ola@eksempel.no"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`participants.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="99887766" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`participants.${index}.birthDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fødselsdato (valgfritt)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Melder på...
                  </>
                ) : (
                  `Meld på ${fields.length} ${fields.length === 1 ? "deltaker" : "deltakere"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
