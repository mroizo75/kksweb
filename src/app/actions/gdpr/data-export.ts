"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logDataExport } from "@/lib/audit-logger";
import { format } from "date-fns";

/**
 * GDPR Data Export - ISO 27001 & GDPR Compliance
 * Eksporter ALL persondata i JSON-format
 */
export async function exportPersonData(personId?: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";

    // Hvis ikke admin, kan bare eksportere egen data
    const targetPersonId = isAdmin && personId ? personId : null;

    // Finn person basert på brukerens e-post eller gitt personId
    let person;
    if (targetPersonId) {
      person = await db.person.findUnique({
        where: { id: targetPersonId },
      });
    } else {
      person = await db.person.findFirst({
        where: { email: session.user.email! },
      });
    }

    if (!person) {
      return { success: false, error: "Person ikke funnet" };
    }

    // Samle ALL data
    const [
      enrollments,
      credentials,
      assessments,
      documents,
      cards,
    ] = await Promise.all([
      db.enrollment.findMany({
        where: { personId: person.id },
        select: {
          id: true,
          status: true,
          notes: true,
          createdAt: true,
          session: {
            include: {
              course: true,
              instructor: true,
            },
          },
        },
      }),

      db.credential.findMany({
        where: { personId: person.id },
        include: {
          course: true,
          policy: true,
        },
      }),

      db.assessment.findMany({
        where: { personId: person.id },
        include: {
          course: true,
          session: true,
        },
      }),

      db.document.findMany({
        where: {
          OR: [
            { enrollment: { personId: person.id } },
            { credential: { personId: person.id } },
          ],
        },
        include: {
          template: { select: { name: true, kind: true } },
        },
      }),

      db.card.findMany({
        where: { credential: { personId: person.id } },
      }),
    ]);

    // Bygg eksportdata
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportedBy: session.user.email,
        dataProtectionOfficer: "kontakt@kkskurs.no",
        gdprRights: {
          rightToAccess: "Du har rett til å få kopi av dine personopplysninger",
          rightToRectification: "Du har rett til å få rettet uriktige opplysninger",
          rightToErasure: "Du har rett til å få slettet dine opplysninger",
          rightToRestriction: "Du har rett til å begrense behandlingen",
          rightToDataPortability: "Du har rett til dataportabilitet",
          rightToObject: "Du har rett til å protestere mot behandlingen",
        },
      },
      personalData: {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email,
        phone: person.phone,
        birthDate: person.birthDate,
        address: person.address,
        postalCode: person.postalCode,
        city: person.city,
        profileImage: person.profileImage,
        createdAt: person.createdAt,
        updatedAt: person.updatedAt,
      },
      company: person.companyId
        ? await db.company.findUnique({
            where: { id: person.companyId },
            select: {
              id: true,
              name: true,
              orgNo: true,
              email: true,
              phone: true,
            },
          })
        : null,
      courseEnrollments: enrollments.map((e: any) => ({
        id: e.id,
        courseName: e.session.course.title,
        sessionDate: e.session.startsAt,
        location: e.session.location,
        status: e.status,
        notes: e.notes,
        enrolledAt: e.createdAt,
      })),
      credentials: credentials.map((c: any) => ({
        id: c.id,
        courseName: c.course.title,
        issuedAt: c.validFrom,
        expiresAt: c.validTo,
        credentialNumber: c.code,
        status: c.status,
        validityPolicy: c.policy?.name,
      })),
      assessments: assessments.map((a: any) => ({
        id: a.id,
        courseName: a.course.title,
        sessionDate: a.session?.startsAt,
        attended: a.attended,
        score: a.score,
        passed: a.passed,
        resultNotes: a.resultNotes,
        assessedAt: a.assessedAt,
      })),
      documents: documents.map((d: any) => ({
        id: d.id,
        templateName: d.template.name,
        templateKind: d.template.kind,
        fileKey: d.fileKey,
        generatedAt: d.generatedAt,
      })),
      cards: cards.map((c: any) => ({
        id: c.id,
        cardNumber: c.number,
        status: c.status,
        orderedAt: c.orderedAt,
        printedAt: c.printedAt,
        shippedAt: c.shippedAt,
      })),
    };

    // Logg i audit log
    await logDataExport(
      userId,
      session.user.email!,
      "Person",
      [person.id]
    );

    return {
      success: true,
      data: exportData,
      filename: `persondata_${person.email}_${format(new Date(), "yyyy-MM-dd")}.json`,
    };
  } catch (error) {
    console.error("Error exporting person data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke eksportere data",
    };
  }
}

/**
 * Send data export til e-post
 */
export async function requestDataExport(email: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    // Eksporter data
    const result = await exportPersonData();

    if (!result.success || !result.data) {
      return { success: false, error: result.error || "Kunne ikke eksportere data" };
    }

    // I en ekte implementasjon ville vi sendt dette via e-post
    // For nå, returnerer vi dataene direkte
    // TODO: Integrer med Resend for å sende som vedlegg

    return {
      success: true,
      message: "Data eksportert. Last ned JSON-filen nedenfor.",
      data: result.data,
      filename: result.filename,
    };
  } catch (error) {
    console.error("Error requesting data export:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke eksportere data",
    };
  }
}

