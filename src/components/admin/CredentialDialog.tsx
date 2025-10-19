"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createCredential } from "@/app/actions/credentials/create";
import { useEffect } from "react";
import { CredentialTypeSelector } from "./CredentialTypeSelector";
import type { CredentialType } from "@prisma/client";

const credentialSchema = z.object({
  personId: z.string().min(1, "Person er påkrevd"),
  courseId: z.string().min(1, "Kurs er påkrevd"),
  completedAt: z.string().min(1, "Fullføringsdato er påkrevd"),
});

type CredentialForm = z.infer<typeof credentialSchema>;

export function CredentialDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [people, setPeople] = useState<{ id: string; firstName: string; lastName: string; email: string | null }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [credentialType, setCredentialType] = useState<CredentialType>("DOCUMENTED");
  const [competenceCodes, setCompetenceCodes] = useState<string[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CredentialForm>({
    resolver: zodResolver(credentialSchema),
  });

  // Fetch people and courses
  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/admin/people").then((r) => r.json()),
        fetch("/api/admin/courses").then((r) => r.json()),
      ]).then(([peopleData, coursesData]) => {
        setPeople(peopleData.people || []);
        setCourses(coursesData.courses || []);
      });
    }
  }, [open]);

  const onSubmit = async (data: CredentialForm) => {
    setIsSubmitting(true);
    try {
      const result = await createCredential({
        personId: data.personId,
        courseId: data.courseId,
        completedAt: new Date(data.completedAt),
        type: credentialType,
        competenceCodes: credentialType === "CERTIFIED" ? competenceCodes : [],
      });

      if (result.success) {
        alert("Kompetansebevis opprettet!");
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nytt kompetansebevis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Opprett kompetansebevis</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="personId">Person *</Label>
            <Select
              value={watch("personId")}
              onValueChange={(value) => setValue("personId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg person..." />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                    {person.email ? ` (${person.email})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.personId && (
              <p className="text-sm text-red-500 mt-1">{errors.personId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="courseId">Kurs *</Label>
            <Select
              value={watch("courseId")}
              onValueChange={(value) => setValue("courseId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg kurs..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseId && (
              <p className="text-sm text-red-500 mt-1">{errors.courseId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="completedAt">Fullføringsdato *</Label>
            <Input
              id="completedAt"
              type="date"
              {...register("completedAt")}
            />
            {errors.completedAt && (
              <p className="text-sm text-red-500 mt-1">{errors.completedAt.message}</p>
            )}
          </div>

          <CredentialTypeSelector
            type={credentialType}
            competenceCodes={competenceCodes}
            onTypeChange={setCredentialType}
            onCodesChange={setCompetenceCodes}
          />

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
                  Oppretter...
                </>
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

