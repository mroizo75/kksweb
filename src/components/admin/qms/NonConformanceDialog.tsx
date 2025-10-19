"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  nonConformanceSchema,
  type NonConformanceInput,
} from "@/lib/validations/qms";
import { createNonConformance } from "@/app/actions/qms/nonConformances";

interface NonConformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: Array<{ id: string; name: string | null; email: string }>;
  companies?: Array<{ id: string; name: string }>;
  people?: Array<{ id: string; firstName: string; lastName: string }>;
  courses?: Array<{ id: string; title: string }>;
}

export function NonConformanceDialog({
  open,
  onOpenChange,
  users,
  companies = [],
  people = [],
  courses = [],
}: NonConformanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NonConformanceInput>({
    resolver: zodResolver(nonConformanceSchema),
    defaultValues: {
      type: "INTERNAL",
      severity: "MINOR",
      category: "PROCESS",
      priority: 2,
      title: "",
      description: "",
      detectedAt: new Date().toISOString().slice(0, 16),
      location: "",
    },
  });

  async function onSubmit(data: NonConformanceInput) {
    setIsLoading(true);

    try {
      const result = await createNonConformance(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Registrer nytt avvik</DialogTitle>
          <DialogDescription>
            Fyll ut informasjon om avviket. Alle felt merket med * er obligatoriske.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Klassifisering */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INTERNAL">Intern</SelectItem>
                        <SelectItem value="EXTERNAL">Ekstern</SelectItem>
                        <SelectItem value="CUSTOMER">Kundeklage</SelectItem>
                        <SelectItem value="SUPPLIER">Leverandøravvik</SelectItem>
                        <SelectItem value="AUDIT">Revisjonsfunn</SelectItem>
                        <SelectItem value="REGULATORY">Myndighetskrav</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alvorlighetsgrad *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg alvorlighetsgrad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CRITICAL">Kritisk</SelectItem>
                        <SelectItem value="MAJOR">Alvorlig</SelectItem>
                        <SelectItem value="MINOR">Mindre alvorlig</SelectItem>
                        <SelectItem value="OBSERVATION">Observasjon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROCESS">Prosess</SelectItem>
                        <SelectItem value="PRODUCT">Produkt/tjeneste</SelectItem>
                        <SelectItem value="DOCUMENTATION">Dokumentasjon</SelectItem>
                        <SelectItem value="EQUIPMENT">Utstyr</SelectItem>
                        <SelectItem value="PERSONNEL">Personell/kompetanse</SelectItem>
                        <SelectItem value="ENVIRONMENT">Miljø/HMS</SelectItem>
                        <SelectItem value="OTHER">Annet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tittel og beskrivelse */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tittel *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Kort beskrivelse av avviket" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Detaljert beskrivelse av hva som er avdekket..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dato, lokasjon, og ansvarlig */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="detectedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dato oppdaget *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasjon</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hvor ble avviket oppdaget?" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tildel til</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "NONE" ? undefined : value)} 
                      value={field.value || "NONE"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg ansvarlig" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Ikke tildelt</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Relasjoner (valgfritt) */}
            <div className="grid gap-4 sm:grid-cols-2">
              {companies.length > 0 && (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relatert bedrift</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "NONE" ? undefined : value)} 
                        value={field.value || "NONE"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg bedrift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">Ingen</SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {courses.length > 0 && (
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relatert kurs</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "NONE" ? undefined : value)} 
                        value={field.value || "NONE"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg kurs" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">Ingen</SelectItem>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Oppretter..." : "Opprett avvik"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

