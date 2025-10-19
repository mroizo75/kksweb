import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays, differenceInDays, format } from "date-fns";
import { nb } from "date-fns/locale";
import { sendLicenseExpiryWarning } from "@/lib/email";

/**
 * Cron job for å sjekke lisenser som snart utløper og sende varslinger
 * 
 * Kjør denne daglig (f.eks. kl 09:00)
 * 
 * Sender varsling:
 * - 30 dager før utløp
 * - 14 dager før utløp
 * - 7 dager før utløp
 * 
 * Suspenderer automatisk lisenser som har passert grace period
 */
export async function GET(req: NextRequest) {
  try {
    // Sjekk CRON_SECRET for sikkerhet
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const results = {
      checked: 0,
      warnings30: 0,
      warnings14: 0,
      warnings7: 0,
      suspended: 0,
      errors: [] as string[],
    };

    // Hent alle aktive lisenser med endDate
    const allLicenses = await db.license.findMany({
      where: {
        status: {
          in: ["ACTIVE", "TRIAL"],
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            gracePeriodDays: true,
          },
        },
      },
    });

    // Filtrer ut lisenser uten endDate
    const licenses = allLicenses.filter(l => l.endDate !== null);

    for (const license of licenses) {
      results.checked++;

      if (!license.endDate || !license.company.email) {
        continue;
      }

      const daysUntilExpiry = differenceInDays(license.endDate, now);
      const gracePeriodEnd = addDays(license.endDate, license.gracePeriodDays);
      const hasPassedGracePeriod = now > gracePeriodEnd;

      // 1. Suspender hvis grace period er passert
      if (hasPassedGracePeriod && license.status !== "EXPIRED") {
        try {
          // Oppdater lisens til EXPIRED
          await db.license.update({
            where: { id: license.id },
            data: {
              status: "EXPIRED",
              suspendedAt: now,
              suspendedBy: "system",
              suspendedReason: "Lisens utløpt og grace period passert",
            },
          });

          // Oppdater company
          await db.company.update({
            where: { id: license.companyId },
            data: {
              licenseStatus: "EXPIRED",
              suspendedAt: now,
              suspendedReason: "Lisens utløpt og grace period passert",
            },
          });

          // Logg aktivitet
          await db.licenseActivity.create({
            data: {
              licenseId: license.id,
              companyId: license.companyId,
              action: "EXPIRED",
              performedBy: "system",
              reason: "Automatisk suspensjon etter grace period",
            },
          });

          results.suspended++;

          // Send e-postvarsling om suspensjon
          await sendLicenseExpiryWarning({
            companyName: license.company.name,
            email: license.company.email,
            daysUntilExpiry: 0,
            expiryDate: format(license.endDate, "d. MMMM yyyy", { locale: nb }),
            contactEmail: process.env.ADMIN_EMAIL || "admin@kkskurs.no",
          });

        } catch (error) {
          console.error(`Error suspending license ${license.id}:`, error);
          results.errors.push(`Failed to suspend license ${license.id}`);
        }
        continue;
      }

      // 2. Send varslinger ved spesifikke datoer
      const shouldSend30DayWarning = daysUntilExpiry === 30;
      const shouldSend14DayWarning = daysUntilExpiry === 14;
      const shouldSend7DayWarning = daysUntilExpiry === 7;

      if (shouldSend30DayWarning || shouldSend14DayWarning || shouldSend7DayWarning) {
        try {
          await sendLicenseExpiryWarning({
            companyName: license.company.name,
            email: license.company.email,
            daysUntilExpiry,
            expiryDate: format(license.endDate, "d. MMMM yyyy", { locale: nb }),
            contactEmail: process.env.ADMIN_EMAIL || "admin@kkskurs.no",
          });

          if (shouldSend30DayWarning) results.warnings30++;
          if (shouldSend14DayWarning) results.warnings14++;
          if (shouldSend7DayWarning) results.warnings7++;

          // Logg aktivitet
          await db.licenseActivity.create({
            data: {
              licenseId: license.id,
              companyId: license.companyId,
              action: "EXTENDED", // Bruker EXTENDED som generisk "notification" action
              performedBy: "system",
              reason: `Varsel sendt: ${daysUntilExpiry} dager til utløp`,
              metadata: { warningDays: daysUntilExpiry },
            },
          });
        } catch (error) {
          console.error(`Error sending warning for license ${license.id}:`, error);
          results.errors.push(`Failed to send warning for license ${license.id}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "License check completed",
      results,
    });

  } catch (error) {
    console.error("Error in license check cron:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

