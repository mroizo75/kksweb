"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { sessionSchema, type SessionInput } from "@/lib/validations/course";
import { createSession, updateSession } from "@/app/actions/createSession";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, CalendarDays } from "lucide-react";
import type { CourseSession, Course, User } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: (CourseSession & { sessionDates?: { id: string; startsAt: Date; endsAt: Date; label: string | null }[] }) | null;
}

export function SessionDialog({ open, onOpenChange, session }: SessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);

  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      try {
        const [coursesRes, instructorsRes] = await Promise.all([
          fetch("/api/admin/courses"),
          fetch("/api/admin/instructors"),
        ]);
        const coursesData = await coursesRes.json();
        const instructorsData = await instructorsRes.json();
        setCourses(coursesData.courses || []);
        setInstructors(instructorsData.instructors || []);
      } catch {
        toast.error("Kunne ikke laste data");
      }
    };
    loadData();
  }, [open]);

  const hasMultipleDates = (session?.sessionDates?.length ?? 0) > 0;

  const form = useForm<SessionInput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      courseId: "",
      startsAt: "",
      endsAt: "",
      location: "",
      capacity: 12,
      instructorId: undefined,
      status: "DRAFT",
      multiDate: false,
      sessionDates: [],
      repeat: false,
      repeatInterval: undefined,
      repeatCount: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sessionDates",
  });

  useEffect(() => {
    if (!open) return;
    if (session) {
      const multiDate = hasMultipleDates;
      form.reset({
        courseId: session.courseId,
        startsAt: multiDate ? "" : format(new Date(session.startsAt), "yyyy-MM-dd'T'HH:mm"),
        endsAt: multiDate ? "" : format(new Date(session.endsAt), "yyyy-MM-dd'T'HH:mm"),
        location: session.location,
        capacity: session.capacity,
        instructorId: session.instructorId || undefined,
        status: session.status,
        multiDate,
        sessionDates: multiDate
          ? (session.sessionDates ?? []).map((d, i) => ({
              id: d.id,
              startsAt: format(new Date(d.startsAt), "yyyy-MM-dd'T'HH:mm"),
              endsAt: format(new Date(d.endsAt), "yyyy-MM-dd'T'HH:mm"),
              label: d.label ?? `Helg ${i + 1}`,
            }))
          : [],
        repeat: false,
        repeatInterval: undefined,
        repeatCount: undefined,
      });
    } else {
      form.reset({
        courseId: "",
        startsAt: "",
        endsAt: "",
        location: "",
        capacity: 12,
        instructorId: undefined,
        status: "DRAFT",
        multiDate: false,
        sessionDates: [],
        repeat: false,
        repeatInterval: undefined,
        repeatCount: undefined,
      });
    }
  }, [open, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const multiDate = form.watch("multiDate");
  const repeatEnabled = form.watch("repeat");

  function addDateBlock() {
    const count = fields.length + 1;
    append({ startsAt: "", endsAt: "", label: `Helg ${count}` });
  }

  const onSubmit = async (data: SessionInput) => {
    setIsSubmitting(true);
    try {
      const result = session
        ? await updateSession(session.id, data)
        : await createSession(data);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Noe gikk galt");
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
          <DialogTitle>{session ? "Rediger sesjon" : "Opprett ny sesjon"}</DialogTitle>
          <DialogDescription>
            {session
              ? "Oppdater sesjoninformasjonen nedenfor"
              : "Fyll inn informasjon om den nye sesjonen"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Kurs */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kurs</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg kurs" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            {/* Multi-dato toggle */}
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
              <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <Label htmlFor="multiDate-switch" className="font-medium cursor-pointer">
                  Kurs over flere helger/perioder
                </Label>
                <p className="text-xs text-muted-foreground">
                  F.eks. YSK som går over to helger
                </p>
              </div>
              <FormField
                control={form.control}
                name="multiDate"
                render={({ field }) => (
                  <Switch
                    id="multiDate-switch"
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked && fields.length === 0) {
                        append({ startsAt: "", endsAt: "", label: "Helg 1" });
                        append({ startsAt: "", endsAt: "", label: "Helg 2" });
                      }
                    }}
                  />
                )}
              />
            </div>

            {/* Enkelt dato ELLER multi-dato */}
            {!multiDate ? (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starttidspunkt</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sluttidspunkt</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Datobolker ({fields.length})</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addDateBlock}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Legg til periode
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-3 space-y-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {form.watch(`sessionDates.${index}.label`) || `Periode ${index + 1}`}
                      </Badge>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 ml-auto text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name={`sessionDates.${index}.label`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Navn</FormLabel>
                            <FormControl>
                              <Input {...f} placeholder="Helg 1" className="h-8 text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`sessionDates.${index}.startsAt`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Start</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...f} className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`sessionDates.${index}.endsAt`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Slutt</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...f} className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sted */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sted</FormLabel>
                  <FormControl>
                    <Input placeholder="Oslo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapasitet</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruktør (valgfritt)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "NONE" ? undefined : value)}
                      value={field.value || "NONE"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg instruktør" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Ingen</SelectItem>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Utkast</SelectItem>
                      <SelectItem value="OPEN">Åpen</SelectItem>
                      <SelectItem value="FULL">Full</SelectItem>
                      <SelectItem value="COMPLETED">Fullført</SelectItem>
                      <SelectItem value="CANCELLED">Avlyst</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Repetering – kun i enkeltdato-modus og opprett */}
            {!session && !multiDate && (
              <>
                <div className="border-t pt-4">
                  <FormField
                    control={form.control}
                    name="repeat"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Gjenta sesjon med intervaller</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Opprett flere sesjoner automatisk
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {repeatEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="repeatInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intervall</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Velg intervall" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="WEEKLY">Ukentlig</SelectItem>
                              <SelectItem value="BIWEEKLY">Hver 14. dag</SelectItem>
                              <SelectItem value="MONTHLY">Månedlig</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repeatCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antall ganger</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="52"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}

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
                    Lagrer...
                  </>
                ) : session ? "Oppdater sesjon" : "Opprett sesjon"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
