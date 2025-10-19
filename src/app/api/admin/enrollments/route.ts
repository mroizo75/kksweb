import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await db.enrollment.findMany({
      include: {
        person: true,
        company: {
          select: { name: true, orgNo: true },
        },
        session: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error("Feil ved henting av påmeldinger:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente påmeldinger" },
      { status: 500 }
    );
  }
}

