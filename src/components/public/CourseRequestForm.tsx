"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requestCourse } from "@/app/actions/requestCourse";
import {
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  Phone,
  Mail,
  Send,
} from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Skriv inn fullt navn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().min(8, "Skriv inn telefonnummer"),
  preferredDate: z.string().min(1, "Oppgi ønsket dato eller periode"),
  participants: z.string().min(1, "Oppgi antall deltakere"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  courseName: string;
  courseSlug: string;
  /** Compact variant for sidebar use */
  compact?: boolean;
}

export function CourseRequestForm({ courseName, courseSlug, compact = false }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const result = await requestCourse({ ...values, courseName, courseSlug });
    if (result.success) {
      setSubmitted(true);
    } else {
      setServerError(result.error ?? "Noe gikk galt");
    }
  };

  if (submitted) {
    return (
      <div className={`flex flex-col items-center text-center gap-3 py-6 ${compact ? "px-2" : "px-4"}`}>
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <p className="font-semibold text-slate-900">Forespørsel sendt!</p>
        <p className="text-sm text-slate-500 leading-relaxed">
          Vi tar kontakt med deg innen 1–2 virkedager for å avtale dato for{" "}
          <strong>{courseName}</strong>.
        </p>
      </div>
    );
  }

  const fieldCls = "h-9 text-sm border-slate-200 focus:border-amber-400 focus:ring-amber-400";
  const errCls = "text-xs text-red-500 mt-0.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-3 ${compact ? "" : "max-w-md"}`} noValidate>
      {/* Name */}
      <div>
        <Input
          {...register("name")}
          placeholder="Fullt navn *"
          className={fieldCls}
          autoComplete="name"
        />
        {errors.name && <p className={errCls}>{errors.name.message}</p>}
      </div>

      {/* Email + Phone in a row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              {...register("email")}
              type="email"
              placeholder="E-post *"
              className={`${fieldCls} pl-8`}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
        <div>
          <div className="relative">
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              {...register("phone")}
              type="tel"
              placeholder="Telefon *"
              className={`${fieldCls} pl-8`}
              autoComplete="tel"
            />
          </div>
          {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
        </div>
      </div>

      {/* Preferred date + participants */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              {...register("preferredDate")}
              placeholder="Ønsket dato *"
              className={`${fieldCls} pl-8`}
            />
          </div>
          {errors.preferredDate && <p className={errCls}>{errors.preferredDate.message}</p>}
        </div>
        <div>
          <div className="relative">
            <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              {...register("participants")}
              placeholder="Ant. deltakere *"
              className={`${fieldCls} pl-8`}
            />
          </div>
          {errors.participants && <p className={errCls}>{errors.participants.message}</p>}
        </div>
      </div>

      {/* Message — hidden in compact mode to keep sidebar slim */}
      {!compact && (
        <div>
          <Textarea
            {...register("message")}
            placeholder="Tilleggsinfo (valgfritt) — ønsket sted, spesielle behov..."
            rows={3}
            className="text-sm border-slate-200 focus:border-amber-400 focus:ring-amber-400 resize-none"
          />
        </div>
      )}

      {serverError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold h-10"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {isSubmitting ? "Sender..." : "Send forespørsel"}
      </Button>
    </form>
  );
}
