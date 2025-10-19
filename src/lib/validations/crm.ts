import { z } from "zod";

export const leadSchema = z.object({
  source: z.string().optional(),
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  phone: z.string().min(8, "Telefonnummer må være minst 8 tegn").optional().or(z.literal("")),
  companyName: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]),
  assignedToId: z.string().cuid().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const dealSchema = z.object({
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  companyId: z.string().cuid().optional().or(z.literal("")),
  personId: z.string().cuid().optional().or(z.literal("")),
  value: z.number().int().min(0, "Verdi må være positiv"),
  stage: z.enum(["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  probability: z.number().int().min(0).max(100),
  expectedCloseDate: z.string().optional(),
  assignedToId: z.string().cuid().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const activitySchema = z.object({
  type: z.enum(["TASK", "CALL", "EMAIL", "MEETING", "NOTE"]),
  subject: z.string().min(3, "Emne må være minst 3 tegn"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  dueDate: z.string().optional(),
  leadId: z.string().cuid().optional().or(z.literal("")),
  dealId: z.string().cuid().optional().or(z.literal("")),
  companyId: z.string().cuid().optional().or(z.literal("")),
  personId: z.string().cuid().optional().or(z.literal("")),
  assignedToId: z.string().cuid().optional().or(z.literal("")),
  // E-post felter
  emailTo: z.string().email().optional().or(z.literal("")),
  emailFrom: z.string().email().optional().or(z.literal("")),
});

export const noteSchema = z.object({
  content: z.string().min(1, "Notat kan ikke være tomt"),
  leadId: z.string().cuid().optional().or(z.literal("")),
  dealId: z.string().cuid().optional().or(z.literal("")),
  companyId: z.string().cuid().optional().or(z.literal("")),
  personId: z.string().cuid().optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type NoteInput = z.infer<typeof noteSchema>;

