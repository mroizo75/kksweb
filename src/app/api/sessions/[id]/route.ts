import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const sessionId = params.id;

    const session = await db.courseSession.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        instructor: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] },
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sesjon ikke funnet" },
        { status: 404 }
      );
    }

    const sessionWithAvailability = {
      ...session,
      enrolledCount: session._count.enrollments,
      availableSpots: session.capacity - session._count.enrollments,
      isFull: session._count.enrollments >= session.capacity,
    };

    return NextResponse.json({ session: sessionWithAvailability });
  } catch (error) {
    console.error("Feil ved henting av sesjon:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente sesjon" },
      { status: 500 }
    );
  }
}

