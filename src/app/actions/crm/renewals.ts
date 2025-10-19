"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendRenewalReminder } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { addMonths } from "date-fns";

type RenewalActionResult =
  | { success: true; message: string; count?: number }
  | { success: false; error: string };

export async function updateRenewalStatus(
  id: string,
  status: "OPEN" | "CONTACTED" | "COMPLETED" | "SKIPPED"
): Promise<RenewalActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.renewalTask.update({
      where: { id },
      data: { status: status as any },
    });

    revalidatePath("/admin/crm/renewals");

    return {
      success: true,
      message: "Status oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdater renewal status:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function sendRenewalEmail(renewalId: string): Promise<RenewalActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const renewal = await db.renewalTask.findUnique({
      where: { id: renewalId },
      include: {
        person: true,
        course: true,
        credential: true,
      },
    });

    if (!renewal) {
      return { success: false, error: "Renewal task ikke funnet" };
    }

    if (!renewal.person.email) {
      return { success: false, error: "Person mangler e-postadresse" };
    }

    // Send påminnelse
    await sendRenewalReminder({
      personName: `${renewal.person.firstName} ${renewal.person.lastName}`,
      email: renewal.person.email,
      courseName: renewal.course.title,
      expiryDate: renewal.credential?.validTo
        ? new Date(renewal.credential.validTo).toLocaleDateString("nb-NO")
        : "Ukjent",
      renewalLink: `${process.env.NEXTAUTH_URL}/kurs/${renewal.course.slug}`,
    });

    // Oppdater emailSentAt og status
    await db.renewalTask.update({
      where: { id: renewalId },
      data: {
        emailSentAt: new Date(),
        status: "CONTACTED",
      },
    });

    revalidatePath("/admin/crm/renewals");

    return {
      success: true,
      message: "Påminnelse sendt",
    };
  } catch (error) {
    console.error("Feil ved sending av påminnelse:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function sendBulkRenewalEmails(renewalIds: string[]): Promise<RenewalActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    let successCount = 0;
    let failedCount = 0;

    for (const renewalId of renewalIds) {
      const result = await sendRenewalEmail(renewalId);
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    revalidatePath("/admin/crm/renewals");

    return {
      success: true,
      message: `${successCount} påminnelser sendt${failedCount > 0 ? `, ${failedCount} feilet` : ""}`,
      count: successCount,
    };
  } catch (error) {
    console.error("Feil ved bulk sending:", error);
    return { success: false, error: "Kunne ikke sende påminnelser" };
  }
}

export async function scanForRenewals(): Promise<RenewalActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Finn credentials som utløper om 6 måneder
    const sixMonthsFromNow = addMonths(new Date(), 6);
    const credentials = await db.credential.findMany({
      where: {
        validTo: {
          lte: sixMonthsFromNow,
          gte: new Date(),
        },
      },
      include: {
        person: true,
        course: true,
      },
    });

    let createdCount = 0;

    for (const credential of credentials) {
      // Sjekk om renewal task allerede eksisterer
      const existing = await db.renewalTask.findFirst({
        where: {
          credentialId: credential.id,
          status: {
            in: ["OPEN", "CONTACTED"],
          },
        },
      });

      if (!existing && credential.validTo) {
        await db.renewalTask.create({
          data: {
            personId: credential.personId,
            courseId: credential.courseId,
            credentialId: credential.id,
            dueDate: credential.validTo,
            status: "OPEN",
          },
        });
        createdCount++;
      }
    }

    revalidatePath("/admin/crm/renewals");

    return {
      success: true,
      message: `${createdCount} nye fornyelsesoppgaver opprettet`,
      count: createdCount,
    };
  } catch (error) {
    console.error("Feil ved scanning for renewals:", error);
    return { success: false, error: "Kunne ikke scanne for fornyelser" };
  }
}

