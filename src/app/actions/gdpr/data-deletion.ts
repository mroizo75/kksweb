"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logDataDelete } from "@/lib/audit-logger";

/**
 * GDPR Data Deletion/Anonymization - ISO 27001 & GDPR Compliance
 * 
 * VIKTIG: Noen data må beholdes av juridiske/regnskapsmessige årsaker.
 * Vi anonymiserer i stedet for å slette helt.
 */

interface DeleteDataOptions {
  personId: string;
  reason: string;
  deleteAll?: boolean; // Hvis false, anonymiser i stedet for å slette
}

export async function requestDataDeletion(options: DeleteDataOptions) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";

    // Finn person
    const person = await db.person.findUnique({
      where: { id: options.personId },
      include: {
        enrollments: true,
        credentials: true,
        company: true,
      },
    });

    if (!person) {
      return { success: false, error: "Person ikke funnet" };
    }

    // Kun admin eller personen selv kan slette
    if (!isAdmin && person.email !== session.user.email) {
      return { success: false, error: "Ingen tilgang" };
    }

    // Sjekk om det er aktive kompetansebevis
    const activeCredentials = person.credentials.filter(
      (c) => c.status === "ACTIVE" && (!c.validTo || c.validTo > new Date())
    );

    if (activeCredentials.length > 0) {
      return {
        success: false,
        error: `Kan ikke slette. Person har ${activeCredentials.length} aktive kompetansebevis.`,
        activeCredentials: activeCredentials.length,
      };
    }

    // Sjekk om det er aktive påmeldinger
    const activeEnrollments = person.enrollments.filter(
      (e) => e.status === "CONFIRMED" || e.status === "PENDING"
    );

    if (activeEnrollments.length > 0) {
      return {
        success: false,
        error: `Kan ikke slette. Person har ${activeEnrollments.length} aktive påmeldinger.`,
        activeEnrollments: activeEnrollments.length,
      };
    }

    // Bestem om vi skal slette eller anonymisere
    const shouldAnonymize = !options.deleteAll || person.enrollments.length > 0;

    if (shouldAnonymize) {
      // ANONYMISER (beholde records, men fjerne persondata)
      const anonymizedEmail = `deleted_${person.id}@anonymized.no`;
      const anonymizedPhone = "00000000";

      await db.person.update({
        where: { id: person.id },
        data: {
          firstName: "SLETTET",
          lastName: "BRUKER",
          email: anonymizedEmail,
          phone: anonymizedPhone,
          birthDate: null,
          address: null,
          postalCode: null,
          city: null,
          profileImage: null,
        },
      });

      // Logg i audit log
      await logDataDelete(
        userId,
        session.user.email!,
        "Person",
        person.id,
        `Anonymization: ${options.reason}`
      );

      return {
        success: true,
        anonymized: true,
        message: "Persondata er anonymisert. Historiske records er beholdt for juridiske formål.",
      };
    } else {
      // SLETT HELT (kun hvis ingen historiske records)
      await db.person.delete({
        where: { id: person.id },
      });

      // Logg i audit log
      await logDataDelete(
        userId,
        session.user.email!,
        "Person",
        person.id,
        `Full deletion: ${options.reason}`
      );

      return {
        success: true,
        deleted: true,
        message: "All persondata er permanent slettet.",
      };
    }
  } catch (error) {
    console.error("Error deleting person data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke slette data",
    };
  }
}

/**
 * Sjekk om person kan slettes
 */
export async function checkDeletionEligibility(personId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const person = await db.person.findUnique({
      where: { id: personId },
      include: {
        enrollments: {
          where: {
            OR: [
              { status: "CONFIRMED" },
              { status: "PENDING" },
            ],
          },
        },
        credentials: {
          where: {
            status: "ACTIVE",
            OR: [
              { validTo: null },
              { validTo: { gt: new Date() } },
            ],
          },
        },
        _count: {
          select: {
            enrollments: true,
            credentials: true,
            assessments: true,
          },
        },
      },
    });

    if (!person) {
      return { success: false, error: "Person ikke funnet" };
    }

    const hasActiveEnrollments = person.enrollments.length > 0;
    const hasActiveCredentials = person.credentials.length > 0;
    const hasHistory = person._count.enrollments > 0 || person._count.credentials > 0;

    return {
      success: true,
      canDelete: !hasActiveEnrollments && !hasActiveCredentials,
      mustAnonymize: hasHistory,
      blockers: {
        activeEnrollments: person.enrollments.length,
        activeCredentials: person.credentials.length,
      },
      history: {
        totalEnrollments: person._count.enrollments,
        totalCredentials: person._count.credentials,
        totalAssessments: person._count.assessments,
      },
    };
  } catch (error) {
    console.error("Error checking deletion eligibility:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke sjekke status",
    };
  }
}

