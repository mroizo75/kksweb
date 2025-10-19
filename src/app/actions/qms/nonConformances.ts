"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  nonConformanceSchema,
  updateNonConformanceSchema,
  type NonConformanceInput,
  type UpdateNonConformanceInput,
} from "@/lib/validations/qms";

type ActionResult =
  | { success: true; ncId?: string; message: string }
  | { success: false; error: string };

/**
 * Generer unikt avviksnummer (NC-YYYY-NNN)
 */
async function generateNcNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `NC-${year}-`;
  
  // Finn siste nummer for dette året
  const lastNc = await db.qmsNonConformance.findFirst({
    where: {
      ncNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      ncNumber: "desc",
    },
  });

  let nextNumber = 1;
  if (lastNc) {
    const lastNumber = parseInt(lastNc.ncNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

/**
 * Opprett nytt avvik
 */
export async function createNonConformance(
  data: NonConformanceInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Verifiser at brukeren finnes i databasen
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      // Hvis brukeren ikke finnes, finn første admin
      const adminUser = await db.user.findFirst({
        orderBy: { createdAt: "asc" },
      });

      if (!adminUser) {
        return { success: false, error: "Ingen brukere i systemet" };
      }

      // Valider input
      const validated = nonConformanceSchema.parse(data);

      // Generer NC-nummer
      const ncNumber = await generateNcNumber();

      // Opprett avvik med admin som reporter
      const nc = await db.qmsNonConformance.create({
        data: {
          ncNumber,
          type: validated.type,
          severity: validated.severity,
          category: validated.category,
          title: validated.title,
          description: validated.description,
          detectedAt: new Date(validated.detectedAt),
          location: validated.location,
          rootCause: validated.rootCause,
          rootCauseMethod: validated.rootCauseMethod,
          status: "OPEN",
          priority: validated.priority || 2,
          reportedBy: adminUser.id,
          assignedTo: validated.assignedTo,
          dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
          companyId: validated.companyId,
          personId: validated.personId,
          courseId: validated.courseId,
          sessionId: validated.sessionId,
        },
      });

      revalidatePath("/admin/kvalitet/avvik");

      return {
        success: true,
        ncId: nc.id,
        message: `Avvik ${ncNumber} opprettet`,
      };
    }

    // Valider input
    const validated = nonConformanceSchema.parse(data);

    // Generer NC-nummer
    const ncNumber = await generateNcNumber();

    // Opprett avvik
    const nc = await db.qmsNonConformance.create({
      data: {
        ncNumber,
        type: validated.type,
        severity: validated.severity,
        category: validated.category,
        title: validated.title,
        description: validated.description,
        detectedAt: new Date(validated.detectedAt),
        location: validated.location,
        rootCause: validated.rootCause,
        rootCauseMethod: validated.rootCauseMethod,
        status: "OPEN",
        priority: validated.priority || 2,
        reportedBy: user.id,
        assignedTo: validated.assignedTo,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        companyId: validated.companyId,
        personId: validated.personId,
        courseId: validated.courseId,
        sessionId: validated.sessionId,
      },
    });

    revalidatePath("/admin/kvalitet/avvik");

    return {
      success: true,
      ncId: nc.id,
      message: `Avvik ${ncNumber} opprettet`,
    };
  } catch (error) {
    console.error("Feil ved opprettelse av avvik:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke opprette avvik" };
  }
}

/**
 * Oppdater eksisterende avvik
 */
export async function updateNonConformance(
  data: UpdateNonConformanceInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = updateNonConformanceSchema.parse(data);

    // Hent eksisterende avvik
    const existing = await db.qmsNonConformance.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: "Avvik ikke funnet" };
    }

    // Sjekk om status endres til CLOSED
    const isClosing = validated.status === "CLOSED" && existing.status !== "CLOSED";

    // Oppdater
    const nc = await db.qmsNonConformance.update({
      where: { id: validated.id },
      data: {
        ...(validated.type && { type: validated.type }),
        ...(validated.severity && { severity: validated.severity }),
        ...(validated.category && { category: validated.category }),
        ...(validated.title && { title: validated.title }),
        ...(validated.description && { description: validated.description }),
        ...(validated.location !== undefined && { location: validated.location }),
        ...(validated.rootCause !== undefined && { rootCause: validated.rootCause }),
        ...(validated.rootCauseMethod !== undefined && { rootCauseMethod: validated.rootCauseMethod }),
        ...(validated.status && { status: validated.status }),
        ...(validated.priority && { priority: validated.priority }),
        ...(validated.assignedTo !== undefined && { assignedTo: validated.assignedTo }),
        ...(validated.dueDate !== undefined && {
          dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        }),
        ...(isClosing && {
          closedBy: session.user.id,
          closedAt: new Date(),
        }),
      },
    });

    revalidatePath("/admin/kvalitet/avvik");
    revalidatePath(`/admin/kvalitet/avvik/${nc.id}`);

    return {
      success: true,
      message: "Avvik oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdatering av avvik:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke oppdatere avvik" };
  }
}

/**
 * Slett avvik
 */
export async function deleteNonConformance(
  ncId: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Sjekk om avvik eksisterer
    const nc = await db.qmsNonConformance.findUnique({
      where: { id: ncId },
      include: {
        correctiveActions: true,
      },
    });

    if (!nc) {
      return { success: false, error: "Avvik ikke funnet" };
    }

    // Kun rapportør kan slette (eller ADMIN - TODO: legg til role-sjekk)
    if (nc.reportedBy !== session.user.id) {
      return { success: false, error: "Kun den som rapporterte avviket kan slette det" };
    }

    // Slett avvik (korrigerende tiltak slettes automatisk via onDelete: Cascade)
    await db.qmsNonConformance.delete({
      where: { id: ncId },
    });

    revalidatePath("/admin/kvalitet/avvik");

    return {
      success: true,
      message: "Avvik slettet",
    };
  } catch (error) {
    console.error("Feil ved sletting av avvik:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke slette avvik" };
  }
}

