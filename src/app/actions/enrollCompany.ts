"use server";

import { db } from "@/lib/db";
import { companyEnrollmentSchema } from "@/lib/validations/enrollment";
import { sendEnrollmentConfirmation } from "@/lib/email";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { revalidatePath } from "next/cache";

export async function enrollCompany(formData: unknown) {
  try {
    // Valider input
    const validatedData = companyEnrollmentSchema.parse(formData);

    // Hent sesjon med kursinfo
    const session = await db.courseSession.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        course: true,
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

    // Sjekk kapasitet for alle deltakere
    const currentEnrollments = session.enrollments.length;
    const availableSpots = session.capacity - currentEnrollments;
    const requestedSpots = validatedData.participants.length;

    if (requestedSpots > availableSpots && availableSpots > 0) {
      return {
        success: false,
        error: `Det er kun ${availableSpots} ${availableSpots === 1 ? "plass" : "plasser"} igjen. Du prøver å melde på ${requestedSpots} ${requestedSpots === 1 ? "person" : "personer"}.`,
      };
    }

    // Opprett eller finn bedrift
    let company = await db.company.findFirst({
      where: validatedData.orgNo
        ? { orgNo: validatedData.orgNo }
        : { name: validatedData.companyName },
    });

    if (!company) {
      company = await db.company.create({
        data: {
          name: validatedData.companyName,
          orgNo: validatedData.orgNo,
          email: validatedData.companyEmail,
          phone: validatedData.companyPhone,
        },
      });
    }

    // Opprett eller oppdater kontaktperson
    const existingContact = await db.contact.findFirst({
      where: {
        companyId: company.id,
        email: validatedData.contactPerson.email,
      },
    });

    if (!existingContact) {
      await db.contact.create({
        data: {
          companyId: company.id,
          firstName: validatedData.contactPerson.firstName,
          lastName: validatedData.contactPerson.lastName,
          email: validatedData.contactPerson.email,
          phone: validatedData.contactPerson.phone,
        },
      });
    }

    // Opprett påmeldinger for alle deltakere
    const enrollments = [];
    const allWaitlist = availableSpots <= 0;

    for (const participant of validatedData.participants) {
      // Opprett eller finn person
      let person = await db.person.findFirst({
        where: participant.email
          ? { email: participant.email }
          : {
              firstName: participant.firstName,
              lastName: participant.lastName,
              companyId: company.id,
            },
      });

      if (!person) {
        person = await db.person.create({
          data: {
            firstName: participant.firstName,
            lastName: participant.lastName,
            email: participant.email,
            phone: participant.phone,
            companyId: company.id,
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

      if (!existingEnrollment) {
        const enrollment = await db.enrollment.create({
          data: {
            sessionId: validatedData.sessionId,
            personId: person.id,
            companyId: company.id,
            status: allWaitlist ? "WAITLIST" : "CONFIRMED",
          },
        });

        enrollments.push(enrollment);

        // Send e-post til deltaker hvis e-post er oppgitt
        if (person.email) {
          try {
            await sendEnrollmentConfirmation({
              personName: `${person.firstName} ${person.lastName}`,
              email: person.email,
              courseName: session.course.title,
              courseDate: format(session.startsAt, "EEEE d. MMMM yyyy", {
                locale: nb,
              }),
              courseTime: format(session.startsAt, "HH:mm", { locale: nb }),
              location: session.location,
              duration: `${session.course.durationDays} ${session.course.durationDays === 1 ? "dag" : "dager"}`,
            });
          } catch (emailError) {
            console.error("Kunne ikke sende e-post:", emailError);
          }
        }
      }
    }

    // Revalidate relevante paths
    revalidatePath(`/kurs/${session.course.slug}`);
    revalidatePath("/admin/pameldinger");

    return {
      success: true,
      enrollmentCount: enrollments.length,
      isWaitlist: allWaitlist,
      companyId: company.id,
    };
  } catch (error) {
    console.error("Feil ved bedriftspåmelding:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

