import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await db.courseSession.findMany({
      where: {
        status: { in: ["COMPLETED", "OPEN", "FULL"] },
      },
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
        enrollments: {
          where: {
            status: { in: ["CONFIRMED", "ATTENDED"] },
          },
          include: {
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { startsAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Feil ved henting av sesjoner for diplom:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente sesjoner" },
      { status: 500 }
    );
  }
}
