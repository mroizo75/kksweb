"use server";

import { db } from "@/lib/db";
import { personEnrollmentSchema } from "@/lib/validations/enrollment";
import { sendEnrollmentConfirmation } from "@/lib/email";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { revalidatePath } from "next/cache";

export async function enrollPerson(formData: unknown) {
  try {
    // Valider input
    const validatedData = personEnrollmentSchema.parse(formData);

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
    const enrollment = await db.enrollment.create({
      data: {
        sessionId: validatedData.sessionId,
        personId: person.id,
        status: isWaitlist ? "WAITLIST" : "CONFIRMED",
      },
    });

    // Send bekreftelse på e-post
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
      console.error("Kunne ikke sende e-post:", emailError);
      // Fortsett selv om e-post feiler
    }

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

