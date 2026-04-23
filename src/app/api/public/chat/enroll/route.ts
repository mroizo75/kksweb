import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEnrollmentConfirmation, sendEnrollmentNotification } from "@/lib/email";
import { triggerCrmEnrollmentHook } from "@/lib/crm-enrollment-hook";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

const chatEnrollSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  sessionId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = chatEnrollSchema.parse(body);

    let sessionId = data.sessionId;

    if (!sessionId) {
      const nextSession = await db.courseSession.findFirst({
        where: {
          status: "OPEN",
          startsAt: { gte: new Date() },
        },
        orderBy: { startsAt: "asc" },
        select: { id: true },
      });

      if (!nextSession) {
        return NextResponse.json(
          { success: false, error: "Ingen tilgjengelige kurs akkurat nå. Ring oss på +47 91 54 08 24 for å avtale." },
          { status: 400 }
        );
      }
      sessionId = nextSession.id;
    }

    const session = await db.courseSession.findUnique({
      where: { id: sessionId },
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
          },
        },
        enrollments: {
          where: { status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] } },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Kurset finnes ikke. Ring oss på +47 91 54 08 24." },
        { status: 400 }
      );
    }

    const isWaitlist = session.enrollments.length >= session.capacity;

    let person = await db.person.findFirst({
      where: { email: data.email },
    });

    if (!person) {
      person = await db.person.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
      });
    }

    const existing = await db.enrollment.findFirst({
      where: {
        sessionId,
        personId: person.id,
        status: { not: "CANCELLED" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Du er allerede påmeldt dette kurset!" },
        { status: 400 }
      );
    }

    const enrollment = await db.enrollment.create({
      data: {
        sessionId,
        personId: person.id,
        status: isWaitlist ? "WAITLIST" : "CONFIRMED",
        basePrice: session.course.price,
        totalPrice: session.course.price,
      },
    });

    try {
      await sendEnrollmentConfirmation({
        personName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        courseName: session.course.title,
        courseDate: format(session.startsAt, "EEEE d. MMMM yyyy", { locale: nb }),
        courseTime: format(session.startsAt, "HH:mm", { locale: nb }),
        location: session.location,
        duration: `${session.course.durationDays} ${session.course.durationDays === 1 ? "dag" : "dager"}`,
      });
    } catch {
      // Continue even if email fails
    }

    try {
      await sendEnrollmentNotification({
        personName: `${data.firstName} ${data.lastName}`,
        personEmail: data.email,
        personPhone: data.phone,
        courseName: session.course.title,
        courseDate: format(session.startsAt, "EEEE d. MMMM yyyy", { locale: nb }),
        courseTime: format(session.startsAt, "HH:mm", { locale: nb }),
        location: session.location,
        enrollmentType: "person",
        status: isWaitlist ? "WAITLIST" : "CONFIRMED",
      });
    } catch {
      // Continue even if email fails
    }

    await triggerCrmEnrollmentHook({
      personId: person.id,
      courseTitle: session.course.title,
      sessionDate: session.startsAt,
      sessionLocation: session.location,
      enrollmentStatus: isWaitlist ? "WAITLIST" : "CONFIRMED",
      isPublicEnrollment: true,
    });

    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      isWaitlist,
      courseName: session.course.title,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Ugyldig informasjon. Sjekk at alle feltene er riktige." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Noe gikk galt. Prøv igjen eller ring +47 91 54 08 24." },
      { status: 500 }
    );
  }
}
