import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const people = await db.person.findMany({
      include: {
        company: {
          select: { name: true, id: true },
        },
        enrollments: {
          include: {
            session: {
              include: {
                course: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ people });
  } catch (error) {
    console.error("Feil ved henting av personer:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente personer" },
      { status: 500 }
    );
  }
}

