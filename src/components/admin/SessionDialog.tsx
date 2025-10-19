"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { sessionSchema, type SessionInput } from "@/lib/validations/course";
import { createSession, updateSession } from "@/app/actions/createSession";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { CourseSession, Course, User } from "@prisma/client";
import { format } from "date-fns";

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: CourseSession | null;
}

export function SessionDialog({ open, onOpenChange, session }: SessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);

  useEffect(() => {
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
      } catch (error) {
        toast.error("Kunne ikke laste data");
      }
    };
    if (open) {
      loadData();
    }
  }, [open]);

  const form = useForm<SessionInput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session
      ? {
          courseId: session.courseId,
          startsAt: format(new Date(session.startsAt), "yyyy-MM-dd'T'HH:mm"),
          endsAt: format(new Date(session.endsAt), "yyyy-MM-dd'T'HH:mm"),
          location: session.location,
          capacity: session.capacity,
          instructorId: session.instructorId || undefined,
          status: session.status,
          repeat: false,
          repeatInterval: undefined,
          repeatCount: undefined,
        }
      : {
          courseId: "",
          startsAt: "",
          endsAt: "",
          location: "",
          capacity: 12,
          instructorId: undefined,
          status: "DRAFT",
          repeat: false,
          repeatInterval: undefined,
          repeatCount: undefined,
        },
  });

  const repeatEnabled = form.watch("repeat");

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
    } catch (error) {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
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

            {!session && (
              <>
                <div className="border-t pt-4">
                  <FormField
                    control={form.control}
                    name="repeat"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Gjenta sesjon med intervaller
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Opprett flere sesjoner automatisk basert på et intervall
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
                ) : session ? (
                  "Oppdater sesjon"
                ) : (
                  "Opprett sesjon"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

