"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  successCount?: number;
  failureCount?: number;
  failures?: Array<{ email: string; reason: string }>;
};

type ParticipantInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
};

type BulkEnrollInput = {
  sessionId: string;
  companyId?: string;
  participants: ParticipantInput[];
};

export async function bulkEnrollParticipants(
  data: BulkEnrollInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const { sessionId, companyId, participants } = data;

    if (!sessionId || !participants || participants.length === 0) {
      return { success: false, error: "Mangler påkrevd data" };
    }

    // Verifiser at sesjonen eksisterer og er åpen
    const courseSession = await db.courseSession.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!courseSession) {
      return { success: false, error: "Sesjon finnes ikke" };
    }

    if (courseSession.status !== "OPEN") {
      return { success: false, error: "Sesjonen er ikke åpen for påmelding" };
    }

    // Sjekk kapasitet
    if (courseSession.capacity) {
      const currentEnrollments = courseSession._count.enrollments;
      const availableSpots = courseSession.capacity - currentEnrollments;

      if (participants.length > availableSpots) {
        return {
          success: false,
          error: `Kun ${availableSpots} ledige plasser på kurset`,
        };
      }
    }

    // Prosesser hver deltaker
    let successCount = 0;
    const failures: Array<{ email: string; reason: string }> = [];

    for (const participant of participants) {
      try {
        // Sjekk om person allerede eksisterer (basert på e-post)
        let person = await db.person.findFirst({
          where: { email: participant.email },
        });

        // Opprett person hvis ikke eksisterer
        if (!person) {
          person = await db.person.create({
            data: {
              firstName: participant.firstName,
              lastName: participant.lastName,
              email: participant.email,
              phone: participant.phone,
              birthDate: participant.birthDate
                ? new Date(participant.birthDate)
                : null,
              companyId: companyId,
            },
          });
        } else if (companyId && !person.companyId) {
          // Oppdater bedrift hvis person eksisterer uten bedrift
          person = await db.person.update({
            where: { id: person.id },
            data: { companyId: companyId },
          });
        }

        // Sjekk om personen allerede er påmeldt denne sesjonen
        const existingEnrollment = await db.enrollment.findFirst({
          where: {
            personId: person.id,
            sessionId: sessionId,
          },
        });

        if (existingEnrollment) {
          failures.push({
            email: participant.email,
            reason: "Allerede påmeldt",
          });
          continue;
        }

        // Opprett påmelding
        await db.enrollment.create({
          data: {
            personId: person.id,
            sessionId: sessionId,
            status: "CONFIRMED",
          },
        });

        successCount++;
      } catch (error) {
        console.error(`Feil ved påmelding av ${participant.email}:`, error);
        failures.push({
          email: participant.email,
          reason: error instanceof Error ? error.message : "Ukjent feil",
        });
      }
    }

    revalidatePath("/admin/pameldinger");
    revalidatePath("/admin/sesjoner");
    revalidatePath("/admin/kunder");

    if (successCount === 0) {
      return {
        success: false,
        error: `Ingen deltakere ble påmeldt. ${failures.length} feil.`,
        failureCount: failures.length,
        failures,
      };
    }

    if (failures.length > 0) {
      return {
        success: true,
        message: `${successCount} av ${participants.length} deltakere påmeldt. ${failures.length} feilet.`,
        successCount,
        failureCount: failures.length,
        failures,
      };
    }

    return {
      success: true,
      message: `${successCount} deltakere påmeldt!`,
      successCount,
      failureCount: 0,
    };
  } catch (error) {
    console.error("Bulk enroll error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke melde på deltakere",
    };
  }
}

