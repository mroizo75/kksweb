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
      select: {
        id: true,
        title: true,
        slug: true,
        code: true,
        category: true,
        description: true,
        durationDays: true,
        price: true,
        image: true,
        published: true,
        validityYears: true,
        learningOutcomes: true,
        targetAudience: true,
        priceIncludes: true,
        bookingAddOns: true,
        createdAt: true,
        updatedAt: true,
        validityPolicyId: true,
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

