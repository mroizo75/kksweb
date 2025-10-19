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
        startsAt: { gte: new Date() },
      },
      include: {
        course: true,
        instructor: {
          select: { name: true },
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
      orderBy: { startsAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Feil ved henting av sesjoner:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente sesjoner" },
      { status: 500 }
    );
  }
}

