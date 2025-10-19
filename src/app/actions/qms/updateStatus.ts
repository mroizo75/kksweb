"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateStatusChange } from "@/lib/qms-utils";

type StatusActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Oppdater status på avvik med ISO 9001 validering
 */
export async function updateNonConformanceStatus(
  ncId: string,
  newStatus: "OPEN" | "INVESTIGATING" | "ACTION" | "VERIFICATION" | "CLOSED" | "REJECTED",
  comment?: string
): Promise<StatusActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Hent avvik
    const nc = await db.qmsNonConformance.findUnique({
      where: { id: ncId },
      include: {
        correctiveActions: true,
      },
    });

    if (!nc) {
      return { success: false, error: "Avvik ikke funnet" };
    }

    // Valider statusendring (ISO 9001)
    const validation = validateStatusChange(
      nc.status,
      newStatus,
      nc.severity,
      nc.correctiveActions.length > 0
    );

    if (!validation.valid) {
      return { success: false, error: validation.error || "Ugyldig statusendring" };
    }

    // Oppdater status
    const updateData: any = {
      status: newStatus,
    };

    // Hvis lukket, sett closedBy og closedAt
    if (newStatus === "CLOSED") {
      updateData.closedBy = session.user.id;
      updateData.closedAt = new Date();
    }

    // Hvis verifisering, sett verifiedBy
    if (newStatus === "VERIFICATION") {
      updateData.verifiedBy = session.user.id;
    }

    await db.qmsNonConformance.update({
      where: { id: ncId },
      data: updateData,
    });

    // TODO: Logg statusendring i historikk (fremtidig funksjon)
    // await db.qmsStatusHistory.create({
    //   data: {
    //     ncId,
    //     fromStatus: nc.status,
    //     toStatus: newStatus,
    //     changedBy: session.user.id,
    //     comment,
    //   }
    // });

    revalidatePath("/admin/kvalitet/avvik");
    revalidatePath(`/admin/kvalitet/avvik/${ncId}`);

    const statusLabels: Record<string, string> = {
      OPEN: "Åpen",
      INVESTIGATING: "Under undersøkelse",
      ACTION: "Tiltak iverksatt",
      VERIFICATION: "Til verifisering",
      CLOSED: "Lukket",
      REJECTED: "Avvist",
    };

    return {
      success: true,
      message: `Status endret til: ${statusLabels[newStatus]}`,
    };
  } catch (error) {
    console.error("Feil ved statusendring:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke endre status" };
  }
}

