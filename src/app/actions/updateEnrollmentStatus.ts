"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: string,
  notes?: string
) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider status
    const validStatuses = ["PENDING", "CONFIRMED", "WAITLIST", "ATTENDED", "NO_SHOW", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Ugyldig status" };
    }

    // Oppdater påmelding
    await db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: status as any,
        notes: notes || null,
      },
    });

    revalidatePath("/admin/pameldinger");

    return { success: true };
  } catch (error) {
    console.error("Feil ved oppdatering av påmelding:", error);
    return {
      success: false,
      error: "Kunne ikke oppdatere påmelding",
    };
  }
}

