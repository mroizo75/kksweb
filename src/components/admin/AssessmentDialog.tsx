"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Loader2 } from "lucide-react";

const assessmentSchema = z.object({
  sessionId: z.string().min(1, "Sesjon er påkrevd"),
  personId: z.string().min(1, "Person er påkrevd"),
  attended: z.boolean(),
  attendanceTime: z.string().optional(),
  passed: z.boolean().optional(),
  score: z.number().min(0).max(100).optional(),
  resultNotes: z.string().optional(),
  assessedBy: z.string().optional(),
});

type AssessmentForm = z.infer<typeof assessmentSchema>;

interface AssessmentDialogProps {
  sessions: Array<{ id: string; startsAt: Date; course: { title: string } }>;
  existingAssessment?: any;
}

export function AssessmentDialog({ sessions, existingAssessment }: AssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [people, setPeople] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssessmentForm>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: existingAssessment
      ? {
          sessionId: existingAssessment.sessionId,
          personId: existingAssessment.personId,
          attended: existingAssessment.attended,
          attendanceTime: existingAssessment.attendanceTime
            ? new Date(existingAssessment.attendanceTime).toISOString().slice(0, 16)
            : undefined,
          passed: existingAssessment.passed ?? undefined,
          score: existingAssessment.score ?? undefined,
          resultNotes: existingAssessment.resultNotes || "",
          assessedBy: existingAssessment.assessedBy || "",
        }
      : {
          attended: false,
        },
  });

  const attended = watch("attended");
  const sessionId = watch("sessionId");

  // Fetch people when session is selected
  useEffect(() => {
    if (open && sessionId) {
      fetch(`/api/admin/enrollments?sessionId=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          const uniquePeople = Array.from(
            new Map(
              data.enrollments.map((e: any) => [e.person.id, e.person])
            ).values()
          );
          setPeople(uniquePeople as any);
        });
    }
  }, [open, sessionId]);

  const onSubmit = async (data: AssessmentForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/assessments", {
        method: existingAssessment ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: existingAssessment?.id,
          attendanceTime: data.attendanceTime ? new Date(data.attendanceTime) : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(existingAssessment ? "Vurdering oppdatert!" : "Vurdering opprettet!");
        setOpen(false);
        reset();
        router.refresh();
      } else {
        alert(`Feil: ${result.error}`);
      }
    } catch (error) {
      alert("En feil oppstod");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existingAssessment ? (
          <Button variant="outline" size="sm" className="gap-1">
            <Edit className="h-3 w-3" />
            Rediger
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ny vurdering
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {existingAssessment ? "Rediger vurdering" : "Opprett vurdering"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="sessionId">Sesjon *</Label>
            <Select
              value={watch("sessionId")}
              onValueChange={(value) => setValue("sessionId", value)}
              disabled={!!existingAssessment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg sesjon..." />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.course.title} -{" "}
                    {new Date(session.startsAt).toLocaleDateString("nb-NO")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sessionId && (
              <p className="text-sm text-red-500 mt-1">{errors.sessionId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="personId">Person *</Label>
            <Select
              value={watch("personId")}
              onValueChange={(value) => setValue("personId", value)}
              disabled={!!existingAssessment || !sessionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg person..." />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.personId && (
              <p className="text-sm text-red-500 mt-1">{errors.personId.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="attended"
              checked={attended}
              onCheckedChange={(checked) => setValue("attended", checked as boolean)}
            />
            <Label htmlFor="attended" className="cursor-pointer">
              Møtt opp
            </Label>
          </div>

          {attended && (
            <>
              <div>
                <Label htmlFor="attendanceTime">Oppmøtetidspunkt</Label>
                <Input
                  id="attendanceTime"
                  type="datetime-local"
                  {...register("attendanceTime")}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="passed"
                  checked={watch("passed") ?? false}
                  onCheckedChange={(checked) => setValue("passed", checked as boolean)}
                />
                <Label htmlFor="passed" className="cursor-pointer">
                  Bestått
                </Label>
              </div>

              <div>
                <Label htmlFor="score">Poengsum (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  {...register("score", { valueAsNumber: true })}
                />
                {errors.score && (
                  <p className="text-sm text-red-500 mt-1">{errors.score.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="resultNotes">Merknader</Label>
                <Textarea
                  id="resultNotes"
                  {...register("resultNotes")}
                  placeholder="Eventuelle merknader om vurderingen..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="assessedBy">Vurdert av</Label>
                <Input
                  id="assessedBy"
                  {...register("assessedBy")}
                  placeholder="Navn på instruktør/vurderer"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
              ) : existingAssessment ? (
                "Oppdater"
              ) : (
                "Opprett"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

