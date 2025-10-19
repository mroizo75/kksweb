"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  auditSchema,
  updateAuditSchema,
  type AuditInput,
  type UpdateAuditInput,
} from "@/lib/validations/qms";

type ActionResult =
  | { success: true; auditId?: string; message: string }
  | { success: false; error: string };

/**
 * Generer unikt audit-nummer
 */
async function generateAuditNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `AUD-${currentYear}-`;

  const lastAudit = await db.qmsAudit.findFirst({
    where: { auditNo: { startsWith: prefix } },
    orderBy: { auditNo: "desc" },
  });

  let nextNumber = 1;
  if (lastAudit) {
    const lastNumber = parseInt(lastAudit.auditNo.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

/**
 * Opprett ny revisjon
 */
export async function createQmsAudit(
  data: AuditInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = auditSchema.parse(data);

    // Generer audit-nummer
    const auditNo = await generateAuditNumber();

    // Opprett revisjon
    const audit = await db.qmsAudit.create({
      data: {
        auditNo,
        type: validated.type,
        scope: validated.scope,
        standard: validated.standard,
        plannedDate: new Date(validated.plannedDate),
        plannedDuration: validated.plannedDuration,
        location: validated.location,
        status: "PLANNED",
        leadAuditor: validated.leadAuditor,
        createdBy: session.user.id,
      },
    });

    revalidatePath("/admin/kvalitet/revisjoner");

    return {
      success: true,
      auditId: audit.id,
      message: `Revisjon ${auditNo} opprettet`,
    };
  } catch (error) {
    console.error("Feil ved opprettelse av revisjon:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke opprette revisjon" };
  }
}

/**
 * Oppdater revisjon
 */
export async function updateQmsAudit(
  data: UpdateAuditInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = updateAuditSchema.parse(data);

    // Hent eksisterende revisjon
    const existing = await db.qmsAudit.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: "Revisjon ikke funnet" };
    }

    // Oppdater
    await db.qmsAudit.update({
      where: { id: validated.id },
      data: {
        ...(validated.scope && { scope: validated.scope }),
        ...(validated.standard !== undefined && {
          standard: validated.standard,
        }),
        ...(validated.plannedDate && {
          plannedDate: new Date(validated.plannedDate),
        }),
        ...(validated.plannedDuration && {
          plannedDuration: validated.plannedDuration,
        }),
        ...(validated.location !== undefined && {
          location: validated.location,
        }),
        ...(validated.status && { status: validated.status }),
        ...(validated.leadAuditor && { leadAuditor: validated.leadAuditor }),
        ...(validated.auditors !== undefined && {
          auditors: validated.auditors,
        }),
        ...(validated.findings !== undefined && {
          findings: validated.findings,
        }),
        ...(validated.reportFileKey !== undefined && {
          reportFileKey: validated.reportFileKey,
        }),
        ...(validated.followUpDate !== undefined && {
          followUpDate: validated.followUpDate
            ? new Date(validated.followUpDate)
            : null,
        }),
      },
    });

    revalidatePath("/admin/kvalitet/revisjoner");
    revalidatePath(`/admin/kvalitet/revisjoner/${validated.id}`);

    return {
      success: true,
      message: "Revisjon oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdatering av revisjon:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke oppdatere revisjon" };
  }
}

/**
 * Start revisjon (endre status til IN_PROGRESS)
 */
export async function startAudit(auditId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.qmsAudit.update({
      where: { id: auditId },
      data: {
        status: "IN_PROGRESS",
      },
    });

    revalidatePath("/admin/kvalitet/revisjoner");
    revalidatePath(`/admin/kvalitet/revisjoner/${auditId}`);

    return { success: true, message: "Revisjon startet" };
  } catch (error) {
    console.error("Feil ved start av revisjon:", error);
    return { success: false, error: "Kunne ikke starte revisjon" };
  }
}

/**
 * Fullfør revisjon (endre status til COMPLETED)
 */
export async function completeAudit(auditId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.qmsAudit.update({
      where: { id: auditId },
      data: {
        status: "COMPLETED",
      },
    });

    revalidatePath("/admin/kvalitet/revisjoner");
    revalidatePath(`/admin/kvalitet/revisjoner/${auditId}`);

    return { success: true, message: "Revisjon fullført" };
  } catch (error) {
    console.error("Feil ved fullføring av revisjon:", error);
    return { success: false, error: "Kunne ikke fullføre revisjon" };
  }
}

/**
 * Lukk revisjon (endre status til CLOSED)
 */
export async function closeAudit(auditId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.qmsAudit.update({
      where: { id: auditId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });

    revalidatePath("/admin/kvalitet/revisjoner");
    revalidatePath(`/admin/kvalitet/revisjoner/${auditId}`);

    return { success: true, message: "Revisjon lukket" };
  } catch (error) {
    console.error("Feil ved lukking av revisjon:", error);
    return { success: false, error: "Kunne ikke lukke revisjon" };
  }
}

/**
 * Slett revisjon
 */
export async function deleteQmsAudit(auditId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const audit = await db.qmsAudit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      return { success: false, error: "Revisjon ikke funnet" };
    }

    // Kun PLANNED kan slettes
    if (audit.status !== "PLANNED") {
      return {
        success: false,
        error: "Kun planlagte revisjoner kan slettes",
      };
    }

    await db.qmsAudit.delete({
      where: { id: auditId },
    });

    revalidatePath("/admin/kvalitet/revisjoner");

    return { success: true, message: "Revisjon slettet" };
  } catch (error) {
    console.error("Feil ved sletting av revisjon:", error);
    return { success: false, error: "Kunne ikke slette revisjon" };
  }
}

