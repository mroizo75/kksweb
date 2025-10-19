"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  correctiveActionSchema,
  updateCorrectiveActionSchema,
  type CorrectiveActionInput,
  type UpdateCorrectiveActionInput,
} from "@/lib/validations/qms";

type ActionResult =
  | { success: true; actionId?: string; message: string }
  | { success: false; error: string };

/**
 * Opprett korrigerende tiltak
 */
export async function createCorrectiveAction(
  data: CorrectiveActionInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = correctiveActionSchema.parse(data);

    // Opprett tiltak
    const action = await db.qmsCorrectiveAction.create({
      data: {
        ncId: validated.ncId,
        title: validated.title,
        description: validated.description,
        actionType: validated.actionType,
        responsibleUser: validated.responsibleUser,
        dueDate: new Date(validated.dueDate),
        status: "PLANNED",
        createdBy: session.user.id,
      },
    });

    revalidatePath("/admin/kvalitet/avvik");
    revalidatePath(`/admin/kvalitet/avvik/${validated.ncId}`);

    return {
      success: true,
      actionId: action.id,
      message: "Korrigerende tiltak opprettet",
    };
  } catch (error) {
    console.error("Feil ved opprettelse av tiltak:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke opprette tiltak" };
  }
}

/**
 * Oppdater korrigerende tiltak
 */
export async function updateCorrectiveAction(
  data: UpdateCorrectiveActionInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = updateCorrectiveActionSchema.parse(data);

    // Hent eksisterende tiltak
    const existing = await db.qmsCorrectiveAction.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: "Tiltak ikke funnet" };
    }

    // Oppdater
    const action = await db.qmsCorrectiveAction.update({
      where: { id: validated.id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description && { description: validated.description }),
        ...(validated.actionType && { actionType: validated.actionType }),
        ...(validated.responsibleUser && { responsibleUser: validated.responsibleUser }),
        ...(validated.dueDate && { dueDate: new Date(validated.dueDate) }),
        ...(validated.status && { status: validated.status }),
        ...(validated.completedAt !== undefined && {
          completedAt: validated.completedAt ? new Date(validated.completedAt) : null,
        }),
        ...(validated.effectiveness !== undefined && { effectiveness: validated.effectiveness }),
        ...(validated.verifiedBy !== undefined && { verifiedBy: validated.verifiedBy }),
        ...(validated.verifiedAt !== undefined && {
          verifiedAt: validated.verifiedAt ? new Date(validated.verifiedAt) : null,
        }),
      },
    });

    revalidatePath("/admin/kvalitet/avvik");
    revalidatePath(`/admin/kvalitet/avvik/${existing.ncId}`);

    return {
      success: true,
      message: "Tiltak oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdatering av tiltak:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke oppdatere tiltak" };
  }
}

/**
 * Slett korrigerende tiltak
 */
export async function deleteCorrectiveAction(
  actionId: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Hent tiltak
    const action = await db.qmsCorrectiveAction.findUnique({
      where: { id: actionId },
    });

    if (!action) {
      return { success: false, error: "Tiltak ikke funnet" };
    }

    // Slett tiltak
    await db.qmsCorrectiveAction.delete({
      where: { id: actionId },
    });

    revalidatePath("/admin/kvalitet/avvik");
    revalidatePath(`/admin/kvalitet/avvik/${action.ncId}`);

    return {
      success: true,
      message: "Tiltak slettet",
    };
  } catch (error) {
    console.error("Feil ved sletting av tiltak:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke slette tiltak" };
  }
}

