import { z } from "zod";

export const licenseSchema = z.object({
  companyId: z.string().min(1, "Bedrift er påkrevd"),
  startDate: z.string().min(1, "Startdato er påkrevd"),
  endDate: z.string().min(1, "Sluttdato er påkrevd"),
  gracePeriodDays: z.number().int().min(0).default(14),
  maxUsers: z.number().int().min(1).optional().nullable(),
  maxEnrollments: z.number().int().min(1).optional().nullable(),
  monthlyPrice: z.number().min(0).optional().nullable(),
  annualPrice: z.number().min(0).optional().nullable(),
  notes: z.string().optional(),
});

export const updateLicenseSchema = z.object({
  id: z.string().min(1),
  endDate: z.string().optional(),
  gracePeriodDays: z.number().int().min(0).optional(),
  maxUsers: z.number().int().min(1).optional().nullable(),
  maxEnrollments: z.number().int().min(1).optional().nullable(),
  monthlyPrice: z.number().min(0).optional().nullable(),
  annualPrice: z.number().min(0).optional().nullable(),
  notes: z.string().optional(),
});

export const suspendLicenseSchema = z.object({
  companyId: z.string().min(1),
  reason: z.string().min(1, "Årsak er påkrevd"),
});

export const resumeLicenseSchema = z.object({
  companyId: z.string().min(1),
  extendDays: z.number().int().min(0).optional(),
});

export type LicenseInput = z.infer<typeof licenseSchema>;
export type UpdateLicenseInput = z.infer<typeof updateLicenseSchema>;
export type SuspendLicenseInput = z.infer<typeof suspendLicenseSchema>;
export type ResumeLicenseInput = z.infer<typeof resumeLicenseSchema>;

