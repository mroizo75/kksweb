import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { nb } from "date-fns/locale";
import { sendEnrollmentReminder } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  if (CRON_SECRET) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const targetDate = addDays(new Date(), 3);
  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);

  const enrollments = await db.enrollment.findMany({
    where: {
      status: { in: ["CONFIRMED", "PENDING"] },
      reminderSentAt: null,
      session: {
        startsAt: { gte: dayStart, lte: dayEnd },
        status: { in: ["OPEN", "FULL"] },
      },
    },
    include: {
      person: true,
      session: {
        include: { course: true },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const enrollment of enrollments) {
    const { person, session } = enrollment;

    if (!person.email) {
      failed++;
      continue;
    }

    const courseDate = format(session.startsAt, "EEEE d. MMMM yyyy", { locale: nb });
    const courseTime = format(session.startsAt, "HH:mm", { locale: nb });
    const endTime = format(session.endsAt, "HH:mm", { locale: nb });

    try {
      await sendEnrollmentReminder({
        personName: `${person.firstName} ${person.lastName}`,
        email: person.email,
        courseName: session.course.title,
        courseDate,
        courseTime: `${courseTime}–${endTime}`,
        location: session.location,
        duration: `${session.course.durationDays} dag${session.course.durationDays > 1 ? "er" : ""}`,
      });

      await db.enrollment.update({
        where: { id: enrollment.id },
        data: { reminderSentAt: new Date() },
      });

      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    message: `Påminnelser sendt: ${sent}, feilet: ${failed}, totalt: ${enrollments.length}`,
    sent,
    failed,
    total: enrollments.length,
    targetDate: format(targetDate, "yyyy-MM-dd"),
  });
}
