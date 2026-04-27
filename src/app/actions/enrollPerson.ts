"use server";

import { db } from "@/lib/db";
import { personEnrollmentSchema } from "@/lib/validations/enrollment";
import { sendEnrollmentConfirmation, sendEnrollmentNotification } from "@/lib/email";
import { triggerCrmEnrollmentHook } from "@/lib/crm-enrollment-hook";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import {
  calculateEnrollmentPricing,
  parseCourseBookingAddOns,
} from "@/lib/booking-add-ons";
import { isMissingColumnError } from "@/lib/prisma-compat";
import { checkFormRateLimit, getServerActionIp } from "@/lib/rate-limit";

export async function enrollPerson(formData: unknown) {
  try {
    const ip = await getServerActionIp();
    const limit = checkFormRateLimit(ip, "enrollment");
    if (!limit.allowed) {
      return { success: false, error: limit.message };
    }

    // Valider input
    const validatedData = personEnrollmentSchema.parse(formData);

    // Hent sesjon med kursinfo
    const session = await db.courseSession.findUnique({
      where: { id: validatedData.sessionId },
      select: {
        id: true,
        startsAt: true,
        capacity: true,
        location: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationDays: true,
            price: true,
            bookingAddOns: true,
          },
        },
        enrollments: {
          where: {
            status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] },
          },
        },
      },
    });

    if (!session) {
      return { success: false, error: "Kurset finnes ikke" };
    }

    const availableAddOns = parseCourseBookingAddOns(session.course.bookingAddOns);
    const availableAddOnIds = new Set(availableAddOns.map((addOn) => addOn.id));
    const selectedAddOnIds = validatedData.selectedAddOnIds ?? [];

    const hasInvalidAddOn = selectedAddOnIds.some(
      (addOnId) => !availableAddOnIds.has(addOnId)
    );
    if (hasInvalidAddOn) {
      return { success: false, error: "Valgt tillegg er ikke gyldig for kurset" };
    }

    const pricing = calculateEnrollmentPricing(
      session.course.price,
      selectedAddOnIds,
      availableAddOns,
      1
    );
    const selectedAddOns = availableAddOns.filter((addOn) =>
      selectedAddOnIds.includes(addOn.id)
    );

    // Sjekk kapasitet
    const currentEnrollments = session.enrollments.length;
    const isWaitlist = currentEnrollments >= session.capacity;

    // Opprett eller finn person
    let person = await db.person.findFirst({
      where: {
        email: validatedData.email,
      },
    });

    if (!person) {
      person = await db.person.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          birthDate: validatedData.birthDate
            ? new Date(validatedData.birthDate)
            : null,
        },
      });
    }

    // Sjekk om personen allerede er påmeldt
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        sessionId: validatedData.sessionId,
        personId: person.id,
        status: { not: "CANCELLED" },
      },
    });

    if (existingEnrollment) {
      return { success: false, error: "Du er allerede påmeldt dette kurset" };
    }

    // Opprett påmelding
    const enrollment = await (async () => {
      try {
        return await db.enrollment.create({
          data: {
            sessionId: validatedData.sessionId,
            personId: person.id,
            status: isWaitlist ? "WAITLIST" : "CONFIRMED",
            basePrice: pricing.baseUnitPrice,
            addOnPrice: pricing.addOnUnitPrice,
            totalPrice: pricing.unitTotal,
            selectedAddOns,
          },
        });
      } catch (error) {
        if (
          !isMissingColumnError(error, [
            "basePrice",
            "addOnPrice",
            "totalPrice",
            "selectedAddOns",
          ])
        ) {
          throw error;
        }

        return db.enrollment.create({
          data: {
            sessionId: validatedData.sessionId,
            personId: person.id,
            status: isWaitlist ? "WAITLIST" : "CONFIRMED",
          },
        });
      }
    })();

    // Send bekreftelse på e-post til deltaker
    try {
      await sendEnrollmentConfirmation({
        personName: `${person.firstName} ${person.lastName}`,
        email: person.email || "",
        courseName: session.course.title,
        courseDate: format(session.startsAt, "EEEE d. MMMM yyyy", { locale: nb }),
        courseTime: format(session.startsAt, "HH:mm", { locale: nb }),
        location: session.location,
        duration: `${session.course.durationDays} ${session.course.durationDays === 1 ? "dag" : "dager"}`,
      });
    } catch (emailError) {
      console.error("Kunne ikke sende bekreftelse til deltaker:", emailError);
      // Fortsett selv om e-post feiler
    }

    // Send notifikasjon til admin
    try {
      await sendEnrollmentNotification({
        personName: `${person.firstName} ${person.lastName}`,
        personEmail: person.email || "",
        personPhone: person.phone || "Ikke oppgitt",
        courseName: session.course.title,
        courseDate: format(session.startsAt, "EEEE d. MMMM yyyy", { locale: nb }),
        courseTime: format(session.startsAt, "HH:mm", { locale: nb }),
        location: session.location,
        enrollmentType: "person",
        status: isWaitlist ? "WAITLIST" : "CONFIRMED",
      });
    } catch (emailError) {
      console.error("Kunne ikke sende admin-notifikasjon:", emailError);
      // Fortsett selv om e-post feiler
    }

    // Koble påmelding til CRM (aktivitet i tidslinje + lead for nye kontakter)
    await triggerCrmEnrollmentHook({
      personId: person.id,
      courseTitle: session.course.title,
      sessionDate: session.startsAt,
      sessionLocation: session.location,
      enrollmentStatus: isWaitlist ? "WAITLIST" : "CONFIRMED",
      isPublicEnrollment: true,
    });

    // Revalidate relevante paths
    revalidatePath(`/kurs/${session.course.slug}`);
    revalidatePath("/admin/pameldinger");

    return {
      success: true,
      enrollmentId: enrollment.id,
      isWaitlist,
    };
  } catch (error) {
    console.error("Feil ved påmelding:", error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "En uventet feil oppstod" };
  }
}

