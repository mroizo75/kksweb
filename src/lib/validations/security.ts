import { z } from "zod";

// ============================================
// SIKKERHETSHENDELSER
// ============================================

export const securityIncidentSchema = z.object({
  type: z.enum([
    "UNAUTHORIZED_ACCESS",
    "DATA_BREACH",
    "MALWARE",
    "PHISHING",
    "DDOS",
    "DATA_LOSS",
    "SYSTEM_FAILURE",
    "POLICY_VIOLATION",
    "SUSPICIOUS_ACTIVITY",
    "OTHER",
  ]),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  description: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  affectedAssets: z.string().optional(),
  detectedAt: z.string().min(1, "Oppdagelsestidspunkt er påkrevd"),
  immediateAction: z.string().optional(),
  dataAffected: z.boolean().optional(),
  notificationRequired: z.boolean().optional(),
  assignedTo: z.string().optional(),
});

export const updateSecurityIncidentSchema = z.object({
  id: z.string(),
  status: z.enum(["REPORTED", "INVESTIGATING", "CONTAINED", "RESOLVED", "CLOSED"]).optional(),
  respondedAt: z.string().optional(),
  resolvedAt: z.string().optional(),
  closedAt: z.string().optional(),
  assignedTo: z.string().optional(),
  immediateAction: z.string().optional(),
  rootCause: z.string().optional(),
  resolution: z.string().optional(),
  preventiveActions: z.string().optional(),
  impactAssessment: z.string().optional(),
});

export type SecurityIncidentInput = z.infer<typeof securityIncidentSchema>;
export type UpdateSecurityIncidentInput = z.infer<typeof updateSecurityIncidentSchema>;

// ============================================
// SIKKERHETSPOLITIKKER
// ============================================

export const securityPolicySchema = z.object({
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  category: z.enum([
    "ACCESS_CONTROL",
    "DATA_PROTECTION",
    "INCIDENT_MANAGEMENT",
    "BACKUP_RECOVERY",
    "PASSWORD_POLICY",
    "ACCEPTABLE_USE",
    "CHANGE_MANAGEMENT",
    "RISK_MANAGEMENT",
    "COMPLIANCE",
    "TRAINING",
  ]),
  description: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  purpose: z.string().min(10, "Formål må være minst 10 tegn"),
  scope: z.string().min(10, "Omfang må være minst 10 tegn"),
  policy: z.string().min(50, "Policy-tekst må være minst 50 tegn"),
  procedures: z.string().optional(),
  reviewSchedule: z.string().optional(),
  nextReview: z.string().optional(),
  applicableTo: z.string().optional(),
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const updateSecurityPolicySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  purpose: z.string().optional(),
  scope: z.string().optional(),
  policy: z.string().optional(),
  procedures: z.string().optional(),
  status: z.enum(["DRAFT", "REVIEW", "APPROVED", "ACTIVE", "ARCHIVED"]).optional(),
  version: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  reviewSchedule: z.string().optional(),
  nextReview: z.string().optional(),
  lastReviewed: z.string().optional(),
  applicableTo: z.string().optional(),
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

export type SecurityPolicyInput = z.infer<typeof securityPolicySchema>;
export type UpdateSecurityPolicyInput = z.infer<typeof updateSecurityPolicySchema>;

// ============================================
// 2FA
// ============================================

export const enable2FASchema = z.object({
  secret: z.string(),
  token: z.string().length(6, "Token må være 6 siffer"),
});

export const verify2FASchema = z.object({
  token: z.string().length(6, "Token må være 6 siffer"),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, "Passord er påkrevd"),
  token: z.string().length(6, "Token må være 6 siffer"),
});

export type Enable2FAInput = z.infer<typeof enable2FASchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type Disable2FAInput = z.infer<typeof disable2FASchema>;

// ============================================
// GDPR - DATA EXPORT & SLETTING
// ============================================

export const dataExportRequestSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  includeEnrollments: z.boolean().optional().default(true),
  includeCredentials: z.boolean().optional().default(true),
  includeAssessments: z.boolean().optional().default(true),
  includeDocuments: z.boolean().optional().default(true),
});

export const dataDeleteRequestSchema = z.object({
  personId: z.string(),
  reason: z.string().min(10, "Årsak må være minst 10 tegn"),
  confirmEmail: z.string().email("Ugyldig e-postadresse"),
});

export type DataExportRequestInput = z.infer<typeof dataExportRequestSchema>;
export type DataDeleteRequestInput = z.infer<typeof dataDeleteRequestSchema>;

