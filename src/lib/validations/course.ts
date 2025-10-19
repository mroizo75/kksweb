import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  slug: z.string().min(3, "Slug må være minst 3 tegn").regex(/^[a-z0-9-]+$/, "Slug kan kun inneholde små bokstaver, tall og bindestreker"),
  code: z.string().min(2, "Kurskode må være minst 2 tegn"),
  category: z.string().min(2, "Kategori må være minst 2 tegn"),
  description: z.string().optional(),
  durationDays: z.number().int().min(1, "Varighet må være minst 1 dag"),
  price: z.number().int().min(0, "Pris kan ikke være negativ"),
  image: z.string().url("Ugyldig bilde-URL").optional().or(z.literal("")),
  published: z.boolean(),
});

export const sessionSchema = z.object({
  courseId: z.string().cuid("Velg et kurs"),
  startsAt: z.string().min(1, "Starttidspunkt er påkrevd"),
  endsAt: z.string().min(1, "Sluttidspunkt er påkrevd"),
  location: z.string().min(3, "Sted må være minst 3 tegn"),
  capacity: z.number().int().min(1, "Kapasitet må være minst 1"),
  instructorId: z.string().cuid().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "OPEN", "FULL", "COMPLETED", "CANCELLED"]),
  // Repetisjonsalternativer
  repeat: z.boolean().optional(),
  repeatInterval: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
  repeatCount: z.number().int().min(1).max(52).optional(),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;

