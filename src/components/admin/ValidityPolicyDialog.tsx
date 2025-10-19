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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Loader2 } from "lucide-react";

const policySchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  kind: z.enum(["NONE", "FIXED_YEARS", "CUSTOM_RULE"]),
  years: z.number().optional(),
  graceDays: z.number().optional(),
  renewalCourseId: z.string().optional(),
});

type PolicyForm = z.infer<typeof policySchema>;

interface ValidityPolicyDialogProps {
  existingPolicy?: any;
}

export function ValidityPolicyDialog({ existingPolicy }: ValidityPolicyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PolicyForm>({
    resolver: zodResolver(policySchema),
    defaultValues: existingPolicy
      ? {
          name: existingPolicy.name,
          kind: existingPolicy.kind,
          years: existingPolicy.years ?? undefined,
          graceDays: existingPolicy.graceDays ?? undefined,
          renewalCourseId: existingPolicy.renewalCourseId ?? undefined,
        }
      : {
          kind: "FIXED_YEARS",
        },
  });

  const kind = watch("kind");

  useEffect(() => {
    if (open) {
      fetch("/api/admin/courses")
        .then((r) => r.json())
        .then((data) => setCourses(data.courses || []));
    }
  }, [open]);

  const onSubmit = async (data: PolicyForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/validity-policies", {
        method: existingPolicy ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: existingPolicy?.id,
          years: data.years || null,
          graceDays: data.graceDays || null,
          renewalCourseId: data.renewalCourseId || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(existingPolicy ? "Policy oppdatert!" : "Policy opprettet!");
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
        {existingPolicy ? (
          <Button variant="outline" size="sm" className="gap-1">
            <Edit className="h-3 w-3" />
            Rediger
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ny policy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {existingPolicy ? "Rediger policy" : "Opprett ny policy"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Navn *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="F.eks. Standard 5 år"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="kind">Type *</Label>
            <Select
              value={watch("kind")}
              onValueChange={(value) => setValue("kind", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Ingen utløp (gyldig permanent)</SelectItem>
                <SelectItem value="FIXED_YEARS">Fast antall år</SelectItem>
                <SelectItem value="CUSTOM_RULE">Egendefinert regel</SelectItem>
              </SelectContent>
            </Select>
            {errors.kind && (
              <p className="text-sm text-red-500 mt-1">{errors.kind.message}</p>
            )}
          </div>

          {kind === "FIXED_YEARS" && (
            <div>
              <Label htmlFor="years">Antall år *</Label>
              <Input
                id="years"
                type="number"
                min="1"
                {...register("years", { valueAsNumber: true })}
                placeholder="F.eks. 5"
              />
              {errors.years && (
                <p className="text-sm text-red-500 mt-1">{errors.years.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="graceDays">Utsettelsesperiode (dager)</Label>
            <Input
              id="graceDays"
              type="number"
              min="0"
              {...register("graceDays", { valueAsNumber: true })}
              placeholder="F.eks. 30"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Antall dager etter utløp hvor kompetansen fortsatt er gyldig
            </p>
          </div>

          <div>
            <Label htmlFor="renewalCourseId">Fornyelseskurs (valgfritt)</Label>
            <Select
              value={watch("renewalCourseId") || "NONE"}
              onValueChange={(value) =>
                setValue("renewalCourseId", value === "NONE" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg kurs..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Ingen</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Kurs som kan tas for å fornye kompetansen
            </p>
          </div>

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
              ) : existingPolicy ? (
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

