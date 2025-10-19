import { z } from "zod";

// ========================================
// Avvikshåndtering
// ========================================

export const nonConformanceSchema = z.object({
  type: z.enum(["INTERNAL", "EXTERNAL", "CUSTOMER", "SUPPLIER", "AUDIT", "REGULATORY"]),
  severity: z.enum(["CRITICAL", "MAJOR", "MINOR", "OBSERVATION"]),
  category: z.enum(["PROCESS", "PRODUCT", "DOCUMENTATION", "EQUIPMENT", "PERSONNEL", "ENVIRONMENT", "OTHER"]),
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  description: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  detectedAt: z.string().min(1, "Dato må fylles ut"),
  location: z.string().optional(),
  rootCause: z.string().optional(),
  rootCauseMethod: z.enum(["5_WHY", "ISHIKAWA", "PARETO"]).optional(),
  priority: z.number().int().min(1).max(3).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  companyId: z.string().optional(),
  personId: z.string().optional(),
  courseId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type NonConformanceInput = z.infer<typeof nonConformanceSchema>;

export const updateNonConformanceSchema = z.object({
  id: z.string(),
  type: z.enum(["INTERNAL", "EXTERNAL", "CUSTOMER", "SUPPLIER", "AUDIT", "REGULATORY"]).optional(),
  severity: z.enum(["CRITICAL", "MAJOR", "MINOR", "OBSERVATION"]).optional(),
  category: z.enum(["PROCESS", "PRODUCT", "DOCUMENTATION", "EQUIPMENT", "PERSONNEL", "ENVIRONMENT", "OTHER"]).optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  location: z.string().optional(),
  rootCause: z.string().optional(),
  rootCauseMethod: z.enum(["5_WHY", "ISHIKAWA", "PARETO"]).optional(),
  status: z.enum(["OPEN", "INVESTIGATING", "ACTION", "VERIFICATION", "CLOSED", "REJECTED"]).optional(),
  priority: z.number().int().min(1).max(3).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

export type UpdateNonConformanceInput = z.infer<typeof updateNonConformanceSchema>;

// ========================================
// Korrigerende tiltak
// ========================================

export const correctiveActionSchema = z.object({
  ncId: z.string(),
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  description: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  actionType: z.enum(["IMMEDIATE", "CORRECTIVE", "PREVENTIVE"]),
  responsibleUser: z.string().min(1, "Ansvarlig må velges"),
  dueDate: z.string().min(1, "Forfallsdato må fylles ut"),
});

export type CorrectiveActionInput = z.infer<typeof correctiveActionSchema>;

export const updateCorrectiveActionSchema = z.object({
  id: z.string(),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  actionType: z.enum(["IMMEDIATE", "CORRECTIVE", "PREVENTIVE"]).optional(),
  responsibleUser: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "VERIFIED", "OVERDUE"]).optional(),
  completedAt: z.string().optional(),
  effectiveness: z.string().optional(),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
});

export type UpdateCorrectiveActionInput = z.infer<typeof updateCorrectiveActionSchema>;

// ========================================
// Dokumenthåndtering
// ========================================

export const qmsDocumentSchema = z.object({
  documentNo: z.string().min(1, "Dokumentnummer må fylles ut"),
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  description: z.string().optional(),
  category: z.enum(["PROCEDURE", "INSTRUCTION", "FORM", "POLICY", "MANUAL", "RECORD", "EXTERNAL"]),
  version: z.string().min(1, "Versjon må fylles ut"),
  effectiveDate: z.string().optional(),
  reviewDate: z.string().optional(),
  fileKey: z.string().min(1, "Fil må lastes opp"),
  ownerId: z.string().min(1, "Dokumenteier må velges"),
});

export type QmsDocumentInput = z.infer<typeof qmsDocumentSchema>;

export const updateQmsDocumentSchema = z.object({
  id: z.string(),
  documentNo: z.string().optional(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.enum(["PROCEDURE", "INSTRUCTION", "FORM", "POLICY", "MANUAL", "RECORD", "EXTERNAL"]).optional(),
  version: z.string().optional(),
  status: z.enum(["DRAFT", "REVIEW", "APPROVED", "EFFECTIVE", "SUPERSEDED", "ARCHIVED"]).optional(),
  effectiveDate: z.string().optional(),
  reviewDate: z.string().optional(),
  ownerId: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
});

export type UpdateQmsDocumentInput = z.infer<typeof updateQmsDocumentSchema>;

// ========================================
// Revisjoner (Audits)
// ========================================

export const auditSchema = z.object({
  type: z.enum(["INTERNAL", "EXTERNAL", "SUPPLIER", "CUSTOMER"]),
  scope: z.string().min(10, "Omfang må beskrive"),
  standard: z.string().optional(),
  plannedDate: z.string().min(1, "Planlagt dato må fylles ut"),
  plannedDuration: z.number().int().min(1, "Varighet må være minst 1 time"),
  location: z.string().optional(),
  leadAuditor: z.string().min(1, "Hovedrevisor må velges"),
});

export type AuditInput = z.infer<typeof auditSchema>;

export const updateAuditSchema = z.object({
  id: z.string(),
  scope: z.string().optional(),
  standard: z.string().optional(),
  plannedDate: z.string().optional(),
  plannedDuration: z.number().int().min(1).optional(),
  location: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "REPORTING", "COMPLETED", "CLOSED"]).optional(),
  leadAuditor: z.string().optional(),
  auditors: z.any().optional(), // JSON array
  findings: z.any().optional(), // JSON array
  reportFileKey: z.string().optional(),
  followUpDate: z.string().optional(),
});

export type UpdateAuditInput = z.infer<typeof updateAuditSchema>;

// ========================================
// Risikohåndtering
// ========================================

export const riskSchema = z.object({
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  description: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  category: z.enum(["STRATEGIC", "OPERATIONAL", "FINANCIAL", "COMPLIANCE", "REPUTATION", "SAFETY"]),
  process: z.string().optional(),
  likelihood: z.number().int().min(1).max(5),
  consequence: z.number().int().min(1).max(5),
  mitigationPlan: z.string().optional(),
  ownerId: z.string().min(1, "Eier må velges"),
  reviewDate: z.string().min(1, "Gjennomgangsdato må fylles ut"),
});

export type RiskInput = z.infer<typeof riskSchema>;

export const updateRiskSchema = z.object({
  id: z.string(),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(["STRATEGIC", "OPERATIONAL", "FINANCIAL", "COMPLIANCE", "REPUTATION", "SAFETY"]).optional(),
  process: z.string().optional(),
  likelihood: z.number().int().min(1).max(5).optional(),
  consequence: z.number().int().min(1).max(5).optional(),
  residualLikelihood: z.number().int().min(1).max(5).optional(),
  residualConsequence: z.number().int().min(1).max(5).optional(),
  mitigationPlan: z.string().optional(),
  status: z.enum(["IDENTIFIED", "ASSESSED", "MITIGATED", "MONITORED", "CLOSED"]).optional(),
  reviewDate: z.string().optional(),
  ownerId: z.string().optional(),
});

export type UpdateRiskInput = z.infer<typeof updateRiskSchema>;

// ========================================
// KPI & Mål
// ========================================

export const kpiSchema = z.object({
  name: z.string().min(3, "Navn må være minst 3 tegn"),
  description: z.string().optional(),
  category: z.enum(["QUALITY", "DELIVERY", "CUSTOMER", "FINANCIAL", "PROCESS", "PERSONNEL", "SAFETY"]),
  unit: z.string().min(1, "Enhet må fylles ut (f.eks %, antall, timer)"),
  target: z.number(),
  threshold: z.number().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  dataSource: z.string().optional(),
  ownerId: z.string().min(1, "Eier må velges"),
});

export type KpiInput = z.infer<typeof kpiSchema>;

export const updateKpiSchema = z.object({
  id: z.string(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.enum(["QUALITY", "DELIVERY", "CUSTOMER", "FINANCIAL", "PROCESS", "PERSONNEL", "SAFETY"]).optional(),
  unit: z.string().optional(),
  target: z.number().optional(),
  threshold: z.number().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  dataSource: z.string().optional(),
  currentValue: z.number().optional(),
  status: z.enum(["ON_TARGET", "WARNING", "OFF_TARGET", "NO_DATA"]).optional(),
  ownerId: z.string().optional(),
  active: z.boolean().optional(),
});

export type UpdateKpiInput = z.infer<typeof updateKpiSchema>;

export const kpiMeasurementSchema = z.object({
  kpiId: z.string(),
  value: z.number(),
  measuredAt: z.string().min(1, "Måledato må fylles ut"),
  note: z.string().optional(),
});

export type KpiMeasurementInput = z.infer<typeof kpiMeasurementSchema>;

