import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCrmSession } from "@/lib/crm-guard";
import { differenceInDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getCrmSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const days = searchParams.get("days");
    const courseId = searchParams.get("courseId");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    } else {
      where.status = { in: ["OPEN", "CONTACTED"] };
    }

    if (days) {
      const daysNumber = parseInt(days);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysNumber);
      where.dueDate = { lte: futureDate };
    }

    if (courseId) {
      where.courseId = courseId;
    }

    // Instruktør ser kun fornyelser tildelt dem
    if (!session.isAdmin) {
      where.assignedToId = session.userId;
    }

    const renewals = await db.renewalTask.findMany({
      where,
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: { select: { id: true, name: true } },
          },
        },
        course: {
          select: { id: true, title: true, slug: true, validityYears: true },
        },
        credential: {
          select: { id: true, validFrom: true, validTo: true },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 500,
    });

    const enriched = renewals.map((r) => {
      const expiryDate = r.credential?.validTo
        ? new Date(r.credential.validTo)
        : new Date(r.dueDate);
      const daysUntilExpiry = differenceInDays(expiryDate, new Date());

      return {
        ...r,
        daysUntilExpiry,
        urgency:
          daysUntilExpiry < 0
            ? "expired"
            : daysUntilExpiry <= 30
            ? "critical"
            : daysUntilExpiry <= 90
            ? "warning"
            : "normal",
      };
    });

    const courses = await db.course.findMany({
      where: {
        renewalTasks: {
          some: session.isAdmin ? {} : { assignedToId: session.userId },
        },
      },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({ renewals: enriched, courses });
  } catch (error) {
    console.error("Feil ved henting av renewals:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente renewals" },
      { status: 500 }
    );
  }
}
