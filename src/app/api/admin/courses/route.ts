import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await db.course.findMany({
      include: {
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Feil ved henting av kurs:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente kurs" },
      { status: 500 }
    );
  }
}

