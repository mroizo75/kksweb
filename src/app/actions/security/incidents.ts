"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  securityIncidentSchema,
  updateSecurityIncidentSchema,
  type SecurityIncidentInput,
  type UpdateSecurityIncidentInput,
} from "@/lib/validations/security";
import { logAudit, logCreate, logUpdate } from "@/lib/audit-logger";

/**
 * Generer unikt incident-nummer
 */
async function generateIncidentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.securityIncident.count({
    where: {
      incidentNumber: {
        startsWith: `SEC-${year}-`,
      },
    },
  });
  const nextNumber = (count + 1).toString().padStart(4, "0");
  return `SEC-${year}-${nextNumber}`;
}

/**
 * Opprett ny sikkerhetshendelse
 */
export async function createSecurityIncident(data: SecurityIncidentInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = securityIncidentSchema.parse(data);

    const incidentNumber = await generateIncidentNumber();

    const incident = await db.securityIncident.create({
      data: {
        incidentNumber,
        type: validated.type,
        severity: validated.severity,
        title: validated.title,
        description: validated.description,
        affectedAssets: validated.affectedAssets,
        detectedAt: new Date(validated.detectedAt),
        reportedBy: (session.user as any).id,
        immediateAction: validated.immediateAction,
        dataAffected: validated.dataAffected ?? false,
        notificationRequired: validated.notificationRequired ?? false,
        assignedTo: validated.assignedTo,
      },
    });

    // Logg i audit log
    await logCreate(
      (session.user as any).id,
      session.user.email!,
      "SecurityIncident",
      incident.id,
      { incidentNumber, title: incident.title, severity: incident.severity }
    );

    revalidatePath("/admin/sikkerhet/hendelser");

    return { success: true, incidentId: incident.id, incidentNumber };
  } catch (error) {
    console.error("Error creating security incident:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Kunne ikke opprette hendelse",
    };
  }
}

/**
 * Oppdater sikkerhetshendelse
 */
export async function updateSecurityIncident(data: UpdateSecurityIncidentInput) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = updateSecurityIncidentSchema.parse(data);

    const incident = await db.securityIncident.findUnique({
      where: { id: validated.id },
    });

    if (!incident) {
      return { success: false, error: "Hendelse ikke funnet" };
    }

    const updateData: any = {};

    if (validated.status) updateData.status = validated.status;
    if (validated.respondedAt) updateData.respondedAt = new Date(validated.respondedAt);
    if (validated.resolvedAt) updateData.resolvedAt = new Date(validated.resolvedAt);
    if (validated.closedAt) updateData.closedAt = new Date(validated.closedAt);
    if (validated.assignedTo !== undefined) updateData.assignedTo = validated.assignedTo || null;
    if (validated.immediateAction) updateData.immediateAction = validated.immediateAction;
    if (validated.rootCause) updateData.rootCause = validated.rootCause;
    if (validated.resolution) updateData.resolution = validated.resolution;
    if (validated.preventiveActions) updateData.preventiveActions = validated.preventiveActions;
    if (validated.impactAssessment) updateData.impactAssessment = validated.impactAssessment;

    await db.securityIncident.update({
      where: { id: validated.id },
      data: updateData,
    });

    // Logg i audit log
    await logUpdate(
      (session.user as any).id,
      session.user.email!,
      "SecurityIncident",
      incident.id,
      { incidentNumber: incident.incidentNumber, changes: validated }
    );

    revalidatePath("/admin/sikkerhet/hendelser");
    revalidatePath(`/admin/sikkerhet/hendelser/${incident.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating security incident:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Kunne ikke oppdatere hendelse",
    };
  }
}

/**
 * Slett sikkerhetshendelse (kun admin)
 */
export async function deleteSecurityIncident(id: string) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const incident = await db.securityIncident.findUnique({
      where: { id },
    });

    if (!incident) {
      return { success: false, error: "Hendelse ikke funnet" };
    }

    await db.securityIncident.delete({
      where: { id },
    });

    // Logg i audit log
    await logAudit({
      action: "DELETE",
      userId: (session.user as any).id,
      userEmail: session.user.email!,
      entity: "SecurityIncident",
      entityId: id,
      description: `Sikkerhetshendelse slettet: ${incident.incidentNumber}`,
      metadata: { incidentNumber: incident.incidentNumber, title: incident.title },
    });

    revalidatePath("/admin/sikkerhet/hendelser");

    return { success: true };
  } catch (error) {
    console.error("Error deleting security incident:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke slette hendelse",
    };
  }
}

