"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  licenseSchema, 
  updateLicenseSchema,
  type LicenseInput,
  type UpdateLicenseInput
} from "@/lib/validations/license";
import { revalidatePath } from "next/cache";
import { suspendCompanyLicense, resumeCompanyLicense } from "@/lib/license";

/**
 * Opprett ny lisens for en bedrift
 */
export async function createLicense(data: LicenseInput) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = licenseSchema.parse(data);

    // Sjekk om bedriften eksisterer
    const company = await db.company.findUnique({
      where: { id: validated.companyId },
    });

    if (!company) {
      return { success: false, error: "Bedrift ikke funnet" };
    }

    // Opprett lisens
    const license = await db.license.create({
      data: {
        companyId: validated.companyId,
        status: "ACTIVE",
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        gracePeriodDays: validated.gracePeriodDays,
        maxUsers: validated.maxUsers,
        maxEnrollments: validated.maxEnrollments,
        monthlyPrice: validated.monthlyPrice,
        annualPrice: validated.annualPrice,
        notes: validated.notes,
      },
    });

    // Oppdater bedrift
    await db.company.update({
      where: { id: validated.companyId },
      data: {
        licenseStatus: "ACTIVE",
        licenseStartDate: new Date(validated.startDate),
        licenseEndDate: new Date(validated.endDate),
        gracePeriodDays: validated.gracePeriodDays,
        maxUsers: validated.maxUsers,
      },
    });

    // Logg aktivitet
    await db.licenseActivity.create({
      data: {
        licenseId: license.id,
        companyId: validated.companyId,
        action: "CREATED",
        performedBy: (session.user as any).id,
        reason: "Ny lisens opprettet",
      },
    });

    revalidatePath("/admin/lisenser");
    revalidatePath("/admin/kunder");

    return { success: true, licenseId: license.id };
  } catch (error) {
    console.error("Error creating license:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke opprette lisens",
    };
  }
}

/**
 * Oppdater eksisterende lisens
 */
export async function updateLicense(data: UpdateLicenseInput) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = updateLicenseSchema.parse(data);

    const license = await db.license.findUnique({
      where: { id: validated.id },
    });

    if (!license) {
      return { success: false, error: "Lisens ikke funnet" };
    }

    // Oppdater lisens
    await db.license.update({
      where: { id: validated.id },
      data: {
        ...(validated.endDate && { endDate: new Date(validated.endDate) }),
        ...(validated.gracePeriodDays !== undefined && { gracePeriodDays: validated.gracePeriodDays }),
        ...(validated.maxUsers !== undefined && { maxUsers: validated.maxUsers }),
        ...(validated.maxEnrollments !== undefined && { maxEnrollments: validated.maxEnrollments }),
        ...(validated.monthlyPrice !== undefined && { monthlyPrice: validated.monthlyPrice }),
        ...(validated.annualPrice !== undefined && { annualPrice: validated.annualPrice }),
        ...(validated.notes !== undefined && { notes: validated.notes }),
      },
    });

    // Oppdater bedrift hvis relevant
    await db.company.update({
      where: { id: license.companyId },
      data: {
        ...(validated.endDate && { licenseEndDate: new Date(validated.endDate) }),
        ...(validated.gracePeriodDays !== undefined && { gracePeriodDays: validated.gracePeriodDays }),
        ...(validated.maxUsers !== undefined && { maxUsers: validated.maxUsers }),
      },
    });

    // Logg aktivitet
    await db.licenseActivity.create({
      data: {
        licenseId: license.id,
        companyId: license.companyId,
        action: "EXTENDED",
        performedBy: (session.user as any).id,
        reason: "Lisens oppdatert",
      },
    });

    revalidatePath("/admin/lisenser");
    revalidatePath("/admin/kunder");

    return { success: true };
  } catch (error) {
    console.error("Error updating license:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke oppdatere lisens",
    };
  }
}

/**
 * Suspender en bedrifts lisens
 */
export async function suspendLicense(companyId: string, reason: string) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const result = await suspendCompanyLicense(companyId, reason, (session.user as any).id);

    revalidatePath("/admin/lisenser");
    revalidatePath("/admin/kunder");

    return result;
  } catch (error) {
    console.error("Error suspending license:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke suspendere lisens",
    };
  }
}

/**
 * Reaktiver en bedrifts lisens
 */
export async function resumeLicense(companyId: string, extendDays?: number) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const result = await resumeCompanyLicense(companyId, (session.user as any).id, extendDays);

    revalidatePath("/admin/lisenser");
    revalidatePath("/admin/kunder");

    return result;
  } catch (error) {
    console.error("Error resuming license:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke reaktivere lisens",
    };
  }
}

/**
 * Slett en lisens (kun inaktive)
 */
export async function deleteLicense(id: string) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const license = await db.license.findUnique({
      where: { id },
    });

    if (!license) {
      return { success: false, error: "Lisens ikke funnet" };
    }

    if (license.status === "ACTIVE") {
      return { success: false, error: "Kan ikke slette aktiv lisens" };
    }

    await db.license.delete({
      where: { id },
    });

    revalidatePath("/admin/lisenser");

    return { success: true };
  } catch (error) {
    console.error("Error deleting license:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke slette lisens",
    };
  }
}

