"use server";

import { db } from "@/lib/db";
import { sessionSchema, type SessionInput } from "@/lib/validations/course";
import { revalidatePath } from "next/cache";
import { addWeeks, addMonths } from "date-fns";

type SessionActionResult =
  | { success: true; sessionId: string; message: string; count?: number }
  | { success: false; error: string };

function deriveDates(data: SessionInput): { startsAt: Date; endsAt: Date } {
  if (data.multiDate && data.sessionDates?.length) {
    const sorted = [...data.sessionDates].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
    return {
      startsAt: new Date(sorted[0].startsAt),
      endsAt: new Date(sorted[sorted.length - 1].endsAt),
    };
  }
  return {
    startsAt: new Date(data.startsAt!),
    endsAt: new Date(data.endsAt!),
  };
}

export async function createSession(formData: unknown): Promise<SessionActionResult> {
  try {
    const validatedData = sessionSchema.parse(formData);
    const { startsAt, endsAt } = deriveDates(validatedData);

    const sessionDatesCreate = validatedData.multiDate && validatedData.sessionDates?.length
      ? validatedData.sessionDates.map((d) => ({
          startsAt: new Date(d.startsAt),
          endsAt: new Date(d.endsAt),
          label: d.label || null,
        }))
      : [];

    // Repetering (kun relevant for enkeltdato-modus)
    if (!validatedData.multiDate && validatedData.repeat && validatedData.repeatInterval && validatedData.repeatCount) {
      const sessions = [];
      for (let i = 0; i < validatedData.repeatCount; i++) {
        let newStartsAt: Date;
        let newEndsAt: Date;

        if (i === 0) {
          newStartsAt = startsAt;
          newEndsAt = endsAt;
        } else {
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
        message: `${sessions.length} ${sessions.length === 1 ? "sesjon" : "sesjoner"} opprettet`,
      };
    }

    const session = await db.courseSession.create({
      data: {
        courseId: validatedData.courseId,
        startsAt,
        endsAt,
        location: validatedData.location,
        capacity: validatedData.capacity,
        instructorId: validatedData.instructorId || null,
        status: validatedData.status,
        sessionDates: sessionDatesCreate.length
          ? { create: sessionDatesCreate }
          : undefined,
      },
    });

    revalidatePath("/admin/sesjoner");
    revalidatePath("/kurs");
    return { success: true, sessionId: session.id, message: "Sesjon opprettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateSession(id: string, formData: unknown): Promise<SessionActionResult> {
  try {
    const validatedData = sessionSchema.parse(formData);
    const { startsAt, endsAt } = deriveDates(validatedData);

    const sessionDatesCreate = validatedData.multiDate && validatedData.sessionDates?.length
      ? validatedData.sessionDates.map((d) => ({
          startsAt: new Date(d.startsAt),
          endsAt: new Date(d.endsAt),
          label: d.label || null,
        }))
      : [];

    // Slett eksisterende datobolker og erstatt med nye
    await db.sessionDate.deleteMany({ where: { sessionId: id } });

    const session = await db.courseSession.update({
      where: { id },
      data: {
        courseId: validatedData.courseId,
        startsAt,
        endsAt,
        location: validatedData.location,
        capacity: validatedData.capacity,
        instructorId: validatedData.instructorId || null,
        status: validatedData.status,
        sessionDates: sessionDatesCreate.length
          ? { create: sessionDatesCreate }
          : undefined,
      },
    });

    revalidatePath("/admin/sesjoner");
    revalidatePath("/kurs");
    return { success: true, sessionId: session.id, message: "Sesjon oppdatert" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteSession(id: string) {
  try {
    const enrollmentsCount = await db.enrollment.count({ where: { sessionId: id } });
    if (enrollmentsCount > 0) {
      return {
        success: false,
        error: `Kan ikke slette sesjon med ${enrollmentsCount} ${enrollmentsCount === 1 ? "påmelding" : "påmeldinger"}`,
      };
    }

    await db.courseSession.delete({ where: { id } });
    revalidatePath("/admin/sesjoner");
    revalidatePath("/kurs");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}
