import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const courseId = params.id;

    const sessions = await db.courseSession.findMany({
      where: {
        courseId,
        startsAt: { gte: new Date() },
        status: { in: ["OPEN", "DRAFT"] },
      },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] },
              },
            },
          },
        },
        instructor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { startsAt: "asc" },
    });

    const sessionsWithAvailability = sessions.map((session) => ({
      ...session,
      enrolledCount: session._count.enrollments,
      availableSpots: session.capacity - session._count.enrollments,
      isFull: session._count.enrollments >= session.capacity,
    }));

    return NextResponse.json({ sessions: sessionsWithAvailability });
  } catch (error) {
    console.error("Feil ved henting av sesjoner:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente sesjoner" },
      { status: 500 }
    );
  }
}

