import { db } from "@/lib/db";
import { AuditAction } from "@prisma/client";

/**
 * Audit Logger - Sentral logging for ISO 27001 compliance
 * 
 * Logg alle viktige handlinger i systemet for sporbarhet og sikkerhet.
 */

export interface AuditLogInput {
  action: AuditAction;
  entity?: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  description?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Logger en handling i audit log
 */
export async function logAudit(input: AuditLogInput) {
  try {
    await db.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        userId: input.userId,
        userEmail: input.userEmail,
        userName: input.userName,
        description: input.description,
        metadata: input.metadata || undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        success: input.success ?? true,
        errorMessage: input.errorMessage,
      },
    });
  } catch (error) {
    // Logg feil, men ikke kast exception - audit logging skal ikke stoppe hovedfunksjonalitet
    console.error("Failed to log audit:", error);
  }
}

/**
 * Logger innlogging (vellykket eller feilet)
 */
export async function logLogin(
  success: boolean,
  email: string,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
) {
  await logAudit({
    action: success ? "LOGIN" : "LOGIN_FAILED",
    userEmail: email,
    ipAddress,
    userAgent,
    success,
    errorMessage,
    description: success
      ? `Bruker ${email} logget inn`
      : `Feilet innloggingsforsøk for ${email}`,
  });
}

/**
 * Logger utlogging
 */
export async function logLogout(userId: string, email: string) {
  await logAudit({
    action: "LOGOUT",
    userId,
    userEmail: email,
    description: `Bruker ${email} logget ut`,
  });
}

/**
 * Logger tilgang nektet
 */
export async function logAccessDenied(
  userId: string,
  email: string,
  resource: string,
  reason?: string
) {
  await logAudit({
    action: "ACCESS_DENIED",
    userId,
    userEmail: email,
    entity: resource,
    description: `Tilgang nektet til ${resource}${reason ? `: ${reason}` : ""}`,
    success: false,
  });
}

/**
 * Logger dataeksport (GDPR)
 */
export async function logDataExport(
  userId: string,
  email: string,
  exportType: string,
  entityIds?: string[]
) {
  await logAudit({
    action: "EXPORT",
    userId,
    userEmail: email,
    entity: exportType,
    description: `Data eksportert: ${exportType}`,
    metadata: { entityIds },
  });
}

/**
 * Logger sletting av data (GDPR)
 */
export async function logDataDelete(
  userId: string,
  email: string,
  entity: string,
  entityId: string,
  reason?: string
) {
  await logAudit({
    action: "DELETE",
    userId,
    userEmail: email,
    entity,
    entityId,
    description: `Data slettet: ${entity} (${entityId})${reason ? ` - ${reason}` : ""}`,
  });
}

/**
 * Logger endring av kritisk data
 */
export async function logUpdate(
  userId: string,
  email: string,
  entity: string,
  entityId: string,
  changes?: any
) {
  await logAudit({
    action: "UPDATE",
    userId,
    userEmail: email,
    entity,
    entityId,
    description: `${entity} oppdatert`,
    metadata: changes,
  });
}

/**
 * Logger opprettelse av entitet
 */
export async function logCreate(
  userId: string,
  email: string,
  entity: string,
  entityId: string,
  data?: any
) {
  await logAudit({
    action: "CREATE",
    userId,
    userEmail: email,
    entity,
    entityId,
    description: `${entity} opprettet`,
    metadata: data,
  });
}

/**
 * Logger 2FA-endringer
 */
export async function log2FAChange(
  userId: string,
  email: string,
  enabled: boolean
) {
  await logAudit({
    action: enabled ? "TWO_FACTOR_ENABLED" : "TWO_FACTOR_DISABLED",
    userId,
    userEmail: email,
    description: `2FA ${enabled ? "aktivert" : "deaktivert"} for ${email}`,
  });
}

/**
 * Logger rolleendringer
 */
export async function logRoleChange(
  adminUserId: string,
  adminEmail: string,
  targetUserId: string,
  targetEmail: string,
  oldRole: string,
  newRole: string
) {
  await logAudit({
    action: "ROLE_CHANGED",
    userId: adminUserId,
    userEmail: adminEmail,
    entity: "User",
    entityId: targetUserId,
    description: `Rolle endret for ${targetEmail}: ${oldRole} → ${newRole}`,
    metadata: { oldRole, newRole, targetUserId, targetEmail },
  });
}

/**
 * Logger lisensendringer
 */
export async function logLicenseChange(
  adminUserId: string,
  adminEmail: string,
  action: "LICENSE_SUSPENDED" | "LICENSE_RESUMED",
  companyId: string,
  companyName: string,
  reason?: string
) {
  await logAudit({
    action,
    userId: adminUserId,
    userEmail: adminEmail,
    entity: "Company",
    entityId: companyId,
    description: `Lisens ${action === "LICENSE_SUSPENDED" ? "suspendert" : "reaktivert"} for ${companyName}`,
    metadata: { companyId, companyName, reason },
  });
}

