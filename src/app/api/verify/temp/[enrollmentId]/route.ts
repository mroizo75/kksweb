import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays } from "date-fns";

/**
 * Verifiser midlertidig bevis
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;

    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        person: true,
        session: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Midlertidig bevis ikke funnet" },
        { status: 404 }
      );
    }

    // Sjekk om beviset fortsatt er gyldig (14 dager fra createdAt)
    const validTo = addDays(new Date(enrollment.createdAt), 14);
    const isValid = new Date() <= validTo;

    return NextResponse.json({
      valid: isValid,
      person: {
        name: `${enrollment.person.firstName} ${enrollment.person.lastName}`,
        birthDate: enrollment.person.birthDate,
      },
      course: {
        title: enrollment.session.course.title,
      },
      completedDate: enrollment.session.startsAt,
      validFrom: enrollment.createdAt,
      validTo,
      status: isValid ? "GYLDIG" : "UTLØPT",
      note: "Dette er et midlertidig bevis. Permanent kompetansebevis vil bli utstedt senere.",
    });
  } catch (error) {
    console.error("Verify temp error:", error);
    return NextResponse.json(
      { error: "Kunne ikke verifisere bevis" },
      { status: 500 }
    );
  }
}

