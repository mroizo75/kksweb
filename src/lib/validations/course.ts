import { z } from "zod";
import { bookingAddOnArraySchema } from "@/lib/booking-add-ons";

export const courseSchema = z.object({
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  slug: z.string().min(3, "Slug må være minst 3 tegn").regex(/^[a-z0-9-]+$/, "Slug kan kun inneholde små bokstaver, tall og bindestreker"),
  code: z.string().min(2, "Kurskode må være minst 2 tegn"),
  category: z.string().min(2, "Kategori må være minst 2 tegn"),
  description: z.string().optional(),
  durationDays: z.number().int().min(1, "Varighet må være minst 1 dag"),
  price: z.number().int().min(0, "Pris kan ikke være negativ"),
  image: z.string().optional().or(z.literal("")),
  published: z.boolean(),
  validityYears: z.number().int().min(1).max(20).nullable().optional(),
  learningOutcomes: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  priceIncludes: z.string().optional().nullable(),
  bookingAddOns: bookingAddOnArraySchema.optional(),
});

export const sessionDateSchema = z.object({
  id: z.string().optional(),
  startsAt: z.string().min(1, "Starttidspunkt er påkrevd"),
  endsAt: z.string().min(1, "Sluttidspunkt er påkrevd"),
  label: z.string().optional(),
});

export const sessionSchema = z.object({
  courseId: z.string().cuid("Velg et kurs"),
  // Enkelt starttidspunkt – kun brukt når multiDate = false
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  location: z.string().min(3, "Sted må være minst 3 tegn"),
  capacity: z.number().int().min(1, "Kapasitet må være minst 1"),
  instructorId: z.string().cuid().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "OPEN", "FULL", "COMPLETED", "CANCELLED"]),
  // Fler-datostøtte (f.eks. YSK over 2 helger)
  multiDate: z.boolean().optional(),
  sessionDates: z.array(sessionDateSchema).optional(),
  // Repetisjonsalternativer
  repeat: z.boolean().optional(),
  repeatInterval: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
  repeatCount: z.number().int().min(1).max(52).optional(),
}).refine(
  (data) => {
    if (data.multiDate) {
      return (data.sessionDates?.length ?? 0) >= 1;
    }
    return !!data.startsAt && !!data.endsAt;
  },
  {
    message: "Legg til minst én datoblokk, eller fyll inn start- og sluttidspunkt",
    path: ["startsAt"],
  }
);

export type CourseInput = z.infer<typeof courseSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type SessionDateInput = z.infer<typeof sessionDateSchema>;

