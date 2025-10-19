"use server";

import { db } from "@/lib/db";
import { sessionSchema, type SessionInput } from "@/lib/validations/course";
import { revalidatePath } from "next/cache";
import { addDays, addWeeks, addMonths } from "date-fns";

type SessionActionResult = 
  | { success: true; sessionId: string; message: string; count?: number }
  | { success: false; error: string };

export async function createSession(formData: unknown): Promise<SessionActionResult> {
  try {
    const validatedData = sessionSchema.parse(formData);

    // Hvis repetering er aktivert, opprett flere sesjoner
    if (validatedData.repeat && validatedData.repeatInterval && validatedData.repeatCount) {
      const sessions = [];
      const startsAt = new Date(validatedData.startsAt);
      const endsAt = new Date(validatedData.endsAt);
      
      for (let i = 0; i < validatedData.repeatCount; i++) {
        let newStartsAt: Date;
        let newEndsAt: Date;

        if (i === 0) {
          // Første sesjon bruker original dato
          newStartsAt = startsAt;
          newEndsAt = endsAt;
        } else {
          // Beregn nye datoer basert på intervall
          switch (validatedData.repeatInterval) {
            case "WEEKLY":
              newStartsAt = addWeeks(startsAt, i);
              newEndsAt = addWeeks(endsAt, i);
              break;
            case "BIWEEKLY":
              newStartsAt = addWeeks(startsAt, i * 2);
              newEndsAt = addWeeks(endsAt, i * 2);
              break;
            case "MONTHLY":
              newStartsAt = addMonths(startsAt, i);
              newEndsAt = addMonths(endsAt, i);
              break;
            default:
              newStartsAt = startsAt;
              newEndsAt = endsAt;
          }
        }

        const session = await db.courseSession.create({
          data: {
            courseId: validatedData.courseId,
            startsAt: newStartsAt,
            endsAt: newEndsAt,
            location: validatedData.location,
            capacity: validatedData.capacity,
            instructorId: validatedData.instructorId || null,
            status: validatedData.status,
          },
        });

        sessions.push(session);
      }

      revalidatePath("/admin/sesjoner");
      revalidatePath("/kurs");

      return {
        success: true,
        sessionId: sessions[0].id,
        count: sessions.length,
        message: `${sessions.length} ${sessions.length === 1 ? 'sesjon' : 'sesjoner'} opprettet`,
      };
    }

    // Enkel sesjon uten repetering
    const session = await db.courseSession.create({
      data: {
        courseId: validatedData.courseId,
        startsAt: new Date(validatedData.startsAt),
        endsAt: new Date(validatedData.endsAt),
        location: validatedData.location,
        capacity: validatedData.capacity,
        instructorId: validatedData.instructorId || null,
        status: validatedData.status,
      },
    });

    revalidatePath("/admin/sesjoner");
    revalidatePath("/kurs");

    return {
      success: true,
      sessionId: session.id,
      message: "Sesjon opprettet",
    };
  } catch (error) {
    console.error("Feil ved opprett sesjon:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateSession(id: string, formData: unknown): Promise<SessionActionResult> {
  try {
    const validatedData = sessionSchema.parse(formData);

    const session = await db.courseSession.update({
      where: { id },
      data: {
        courseId: validatedData.courseId,
        startsAt: new Date(validatedData.startsAt),
        endsAt: new Date(validatedData.endsAt),
        location: validatedData.location,
        capacity: validatedData.capacity,
        instructorId: validatedData.instructorId || null,
        status: validatedData.status,
      },
    });

    revalidatePath("/admin/sesjoner");
    revalidatePath("/kurs");

    return {
      success: true,
      sessionId: session.id,
      message: "Sesjon oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdater sesjon:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteSession(id: string) {
  try {
    // Sjekk om sesjonen har påmeldinger
    const enrollmentsCount = await db.enrollment.count({
      where: { sessionId: id },
    });

    if (enrollmentsCount > 0) {
      return {
        success: false,
        error: `Kan ikke slette sesjon med ${enrollmentsCount} ${enrollmentsCount === 1 ? "påmelding" : "påmeldinger"}`,
      };
    }

    await db.courseSession.delete({
      where: { id },
    });

    revalidatePath("/admin/sesjoner");
    revalidatePath("/kurs");

    return { success: true };
  } catch (error) {
    console.error("Feil ved slett sesjon:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

