import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await db.company.findMany({
      include: {
        people: true,
        contacts: true,
        enrollments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Feil ved henting av bedrifter:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente bedrifter" },
      { status: 500 }
    );
  }
}

