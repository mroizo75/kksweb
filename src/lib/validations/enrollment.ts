import { z } from "zod";

export const personEnrollmentSchema = z.object({
  sessionId: z.string().cuid(),
  firstName: z.string().min(2, "Fornavn må være minst 2 tegn"),
  lastName: z.string().min(2, "Etternavn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().min(8, "Telefonnummer må være minst 8 siffer"),
  birthDate: z.string().optional(),
});

export const companyEnrollmentSchema = z.object({
  sessionId: z.string().cuid(),
  companyName: z.string().min(2, "Bedriftsnavn må være minst 2 tegn"),
  orgNo: z.string().regex(/^\d{9}$/, "Organisasjonsnummer må være 9 siffer").optional(),
  companyEmail: z.string().email("Ugyldig e-postadresse"),
  companyPhone: z.string().min(8, "Telefonnummer må være minst 8 siffer"),
  contactPerson: z.object({
    firstName: z.string().min(2, "Fornavn må være minst 2 tegn"),
    lastName: z.string().min(2, "Etternavn må være minst 2 tegn"),
    email: z.string().email("Ugyldig e-postadresse"),
    phone: z.string().min(8, "Telefonnummer må være minst 8 siffer"),
  }),
  participants: z.array(
    z.object({
      firstName: z.string().min(2, "Fornavn må være minst 2 tegn"),
      lastName: z.string().min(2, "Etternavn må være minst 2 tegn"),
      email: z.string().email("Ugyldig e-postadresse").optional(),
      phone: z.string().optional(),
    })
  ).min(1, "Minimum én deltaker må legges til"),
});

export type PersonEnrollmentInput = z.infer<typeof personEnrollmentSchema>;
export type CompanyEnrollmentInput = z.infer<typeof companyEnrollmentSchema>;

