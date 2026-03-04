/**
 * CRM Enrollment Hook
 *
 * Kobler kurspåmeldinger til CRM-systemet automatisk:
 * - Oppretter en CRM-aktivitet (synlig i tidslinje) for person og bedrift
 * - Oppretter en Lead med kilde "Kurspåmelding" for nye publiske påmeldinger
 * - Revaliderer CRM-sider slik at data vises umiddelbart
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface EnrollmentCrmOptions {
  personId: string;
  companyId?: string | null;
  courseTitle: string;
  sessionDate: Date;
  sessionLocation: string;
  enrollmentStatus: "CONFIRMED" | "WAITLIST";
  /** Satt til false for admin-initierte påmeldinger; true for offentlige nettsidepåmeldinger */
  isPublicEnrollment?: boolean;
  /** Bruker-ID fra admin-session; null for publiske påmeldinger */
  adminUserId?: string | null;
}

/**
 * Finn system-bruker (første ADMIN) til å signere systemgenererte aktiviteter.
 */
async function getSystemUserId(): Promise<string | null> {
  const admin = await db.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return admin?.id ?? null;
}

/**
 * Hovedfunksjon: Opprett CRM-aktivitet og (om nødvendig) Lead for en påmelding.
 * Kall denne etter at Enrollment er opprettet.
 */
export async function triggerCrmEnrollmentHook(
  opts: EnrollmentCrmOptions
): Promise<void> {
  try {
    const actorId = opts.adminUserId ?? (await getSystemUserId());
    if (!actorId) return; // Ingen bruker å signere med – avbryt stille

    const dateStr = format(opts.sessionDate, "d. MMMM yyyy", { locale: nb });
    const statusLabel =
      opts.enrollmentStatus === "WAITLIST" ? "venteliste" : "bekreftet";

    const subject = `Kurspåmelding: ${opts.courseTitle}`;
    const description =
      `Påmeldt "${opts.courseTitle}" (${dateStr}, ${opts.sessionLocation}) – ` +
      `status: ${statusLabel}`;

    // 1. Opprett CRM-aktivitet på personen (synlig i tidslinje)
    await db.activity.create({
      data: {
        type: "NOTE",
        subject,
        description,
        status: "COMPLETED",
        personId: opts.personId,
        companyId: opts.companyId ?? null,
        createdById: actorId,
        assignedToId: actorId,
      },
    });

    // 2. For offentlige påmeldinger – opprett en Lead hvis personen ikke allerede
    //    har en åpen lead knyttet til seg (lead.email = person.email).
    if (opts.isPublicEnrollment) {
      const person = await db.person.findUnique({
        where: { id: opts.personId },
        select: { firstName: true, lastName: true, email: true, companyId: true },
      });

      if (person?.email) {
        const existingLead = await db.lead.findFirst({
          where: {
            email: person.email,
            status: { notIn: ["CONVERTED", "LOST"] },
          },
        });

        if (!existingLead) {
          let companyName: string | undefined;
          if (opts.companyId) {
            const co = await db.company.findUnique({
              where: { id: opts.companyId },
              select: { name: true },
            });
            companyName = co?.name;
          }

          await db.lead.create({
            data: {
              name: `${person.firstName} ${person.lastName}`,
              email: person.email,
              companyName: companyName ?? null,
              source: "Kurspåmelding",
              status: "NEW",
              notes: `Meldte seg på "${opts.courseTitle}" (${dateStr})`,
              assignedToId: actorId,
            },
          });
        }
      }
    }

    // 3. Revalidering av CRM-sider
    revalidatePath("/admin/crm/kontakter");
    revalidatePath(`/admin/crm/kontakter/${opts.personId}`);
    revalidatePath("/admin/crm/leads");
    if (opts.companyId) {
      revalidatePath("/admin/crm/bedrifter");
      revalidatePath(`/admin/crm/bedrifter/${opts.companyId}`);
    }
  } catch (err) {
    // Logg feil, men la aldri CRM-hooken stoppe selve påmeldingen
    console.error("[CRM Enrollment Hook] Feil:", err);
  }
}
