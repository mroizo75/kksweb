import { db } from "@/lib/db";
import { addDays, isPast, isAfter, format } from "date-fns";
import { nb } from "date-fns/locale";
import { sendLicenseSuspended, sendLicenseResumed } from "@/lib/email";

export type LicenseStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CANCELLED";

/**
 * Sjekker om en bedrift har gyldig lisens
 */
export async function checkCompanyLicense(companyId: string): Promise<{
  isValid: boolean;
  status: LicenseStatus;
  message?: string;
  daysUntilExpiry?: number;
}> {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: {
      licenseStatus: true,
      licenseEndDate: true,
      gracePeriodDays: true,
      suspendedAt: true,
      suspendedReason: true,
    },
  });

  if (!company) {
    return {
      isValid: false,
      status: "CANCELLED",
      message: "Bedrift ikke funnet",
    };
  }

  // Sjekk suspensjon
  if (company.licenseStatus === "SUSPENDED") {
    return {
      isValid: false,
      status: "SUSPENDED",
      message: company.suspendedReason || "Lisens er suspendert. Kontakt support.",
    };
  }

  // Sjekk kansellering
  if (company.licenseStatus === "CANCELLED") {
    return {
      isValid: false,
      status: "CANCELLED",
      message: "Lisens er kansellert. Kontakt support for reaktivering.",
    };
  }

  // Sjekk utløpsdato
  if (company.licenseEndDate) {
    const now = new Date();
    const endDate = new Date(company.licenseEndDate);
    const graceEndDate = addDays(endDate, company.gracePeriodDays || 0);

    // Hvis vi er forbi grace period
    if (isPast(graceEndDate)) {
      return {
        isValid: false,
        status: "EXPIRED",
        message: "Lisens har utløpt. Forny lisensen for å fortsette.",
      };
    }

    // Hvis vi er forbi end date men innenfor grace period
    if (isPast(endDate) && !isPast(graceEndDate)) {
      const daysLeft = Math.ceil((graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        isValid: true,
        status: "ACTIVE",
        message: `Lisens er i nådeperiode. ${daysLeft} dager igjen til suspensjon.`,
        daysUntilExpiry: daysLeft,
      };
    }

    // Normal aktiv lisens
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30) {
      return {
        isValid: true,
        status: "ACTIVE",
        message: `Lisens utløper om ${daysUntilExpiry} dager. Forny snart.`,
        daysUntilExpiry,
      };
    }

    return {
      isValid: true,
      status: "ACTIVE",
      daysUntilExpiry,
    };
  }

  // Trial eller ingen end date = gyldig
  return {
    isValid: company.licenseStatus === "TRIAL" || company.licenseStatus === "ACTIVE",
    status: company.licenseStatus as LicenseStatus,
    message: company.licenseStatus === "TRIAL" ? "Trial-periode aktiv" : undefined,
  };
}

/**
 * Henter bedriftens lisens-info for en bruker
 */
export async function getUserCompanyLicense(userId: string) {
  // Finn brukerens person
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) {
    return null;
  }

  // Finn person basert på e-post
  const person = await db.person.findFirst({
    where: { email: user.email },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          licenseStatus: true,
          licenseEndDate: true,
          gracePeriodDays: true,
          suspendedAt: true,
          suspendedReason: true,
        },
      },
    },
  });

  if (!person?.company) {
    return null;
  }

  const licenseCheck = await checkCompanyLicense(person.company.id);

  return {
    company: person.company,
    license: licenseCheck,
  };
}

/**
 * Suspender bedriftens lisens
 */
export async function suspendCompanyLicense(
  companyId: string,
  reason: string,
  suspendedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Hent bedriftsinformasjon
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        email: true,
      },
    });

    if (!company) {
      return { success: false, error: "Bedrift ikke funnet" };
    }

    // Oppdater company
    await db.company.update({
      where: { id: companyId },
      data: {
        licenseStatus: "SUSPENDED",
        suspendedAt: new Date(),
        suspendedReason: reason,
      },
    });

    // Finn aktiv lisens
    const activeLicense = await db.license.findFirst({
      where: {
        companyId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (activeLicense) {
      // Oppdater lisens
      await db.license.update({
        where: { id: activeLicense.id },
        data: {
          status: "SUSPENDED",
          suspendedAt: new Date(),
          suspendedBy,
          suspendedReason: reason,
        },
      });

      // Logg aktivitet
      await db.licenseActivity.create({
        data: {
          licenseId: activeLicense.id,
          companyId,
          action: "SUSPENDED",
          performedBy: suspendedBy,
          reason,
        },
      });
    }

    // Send e-postvarsling til bedriften
    if (company.email) {
      try {
        await sendLicenseSuspended({
          companyName: company.name,
          email: company.email,
          reason,
          contactEmail: process.env.ADMIN_EMAIL || "admin@kkskurs.no",
        });
      } catch (emailError) {
        console.error("Kunne ikke sende suspensjonsvarsling:", emailError);
        // Ikke kast feil - suspensjon skal fortsatt gjennomføres
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error suspending license:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke suspendere lisens",
    };
  }
}

/**
 * Reaktiver bedriftens lisens
 */
export async function resumeCompanyLicense(
  companyId: string,
  performedBy: string,
  extendDays?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        email: true,
        licenseEndDate: true,
      },
    });

    if (!company) {
      return { success: false, error: "Bedrift ikke funnet" };
    }

    // Beregn ny end date hvis vi utvider
    let newEndDate = company.licenseEndDate;
    if (extendDays && newEndDate) {
      newEndDate = addDays(new Date(newEndDate), extendDays);
    }

    // Oppdater company
    await db.company.update({
      where: { id: companyId },
      data: {
        licenseStatus: "ACTIVE",
        licenseEndDate: newEndDate,
        suspendedAt: null,
        suspendedReason: null,
      },
    });

    // Finn suspendert lisens
    const suspendedLicense = await db.license.findFirst({
      where: {
        companyId,
        status: "SUSPENDED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (suspendedLicense) {
      // Oppdater lisens
      await db.license.update({
        where: { id: suspendedLicense.id },
        data: {
          status: "ACTIVE",
          endDate: newEndDate || suspendedLicense.endDate,
          suspendedAt: null,
          suspendedBy: null,
          suspendedReason: null,
        },
      });

      // Logg aktivitet
      await db.licenseActivity.create({
        data: {
          licenseId: suspendedLicense.id,
          companyId,
          action: extendDays ? "EXTENDED" : "RESUMED",
          performedBy,
          reason: extendDays ? `Lisens utvidet med ${extendDays} dager` : "Lisens reaktivert",
          metadata: extendDays ? { extendedDays: extendDays } : undefined,
        },
      });
    }

    // Send e-postvarsling til bedriften
    if (company.email && newEndDate) {
      try {
        await sendLicenseResumed({
          companyName: company.name,
          email: company.email,
          newExpiryDate: format(newEndDate, "d. MMMM yyyy", { locale: nb }),
        });
      } catch (emailError) {
        console.error("Kunne ikke sende reaktiveringsvarsling:", emailError);
        // Ikke kast feil - reaktivering skal fortsatt gjennomføres
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error resuming license:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke reaktivere lisens",
    };
  }
}

