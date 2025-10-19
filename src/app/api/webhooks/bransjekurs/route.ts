import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCredential } from "@/app/actions/credentials/create";

/**
 * Bransjekurs.no webhook
 * Mottar digitale kursresultater og oppdaterer systemet
 */

interface BransjekursWebhookPayload {
  externalId: string; // Bransjekurs sin ID
  person: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    birthDate?: string; // ISO format
  };
  courseCode: string; // Kurskode som matcher vårt system
  completedAt: string; // ISO datetime
  score?: number; // 0-100
  passed: boolean;
  modules?: string[]; // Fullførte moduler
  certificateUrl?: string; // URL til sertifikat fra Bransjekurs
}

export async function POST(request: Request) {
  try {
    // Verifiser webhook (i prod: sjekk signature/API key)
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.BRANSJEKURS_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload: BransjekursWebhookPayload = await request.json();

    // Valider payload
    if (!payload.externalId || !payload.person || !payload.courseCode) {
      return NextResponse.json(
        { success: false, error: "Ugyldig payload" },
        { status: 400 }
      );
    }

    // Finn eller opprett person (deduplisering)
    let person = await db.person.findFirst({
      where: {
        OR: [
          { email: payload.person.email || undefined },
          {
            AND: [
              { firstName: payload.person.firstName },
              { lastName: payload.person.lastName },
              { birthDate: payload.person.birthDate ? new Date(payload.person.birthDate) : undefined },
            ],
          },
        ],
      },
    });

    if (!person) {
      // Opprett ny person
      person = await db.person.create({
        data: {
          firstName: payload.person.firstName,
          lastName: payload.person.lastName,
          email: payload.person.email || null,
          phone: payload.person.phone || null,
          birthDate: payload.person.birthDate ? new Date(payload.person.birthDate) : null,
        },
      });
    }

    // Finn kurs basert på kurskode
    const course = await db.course.findFirst({
      where: { code: payload.courseCode },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: `Kurs med kode ${payload.courseCode} ikke funnet`,
        },
        { status: 404 }
      );
    }

    // Sjekk om enrollment allerede eksisterer (idempotency)
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        personId: person.id,
        session: {
          courseId: course.id,
        },
      },
    });

    let enrollment;
    if (existingEnrollment) {
      // Oppdater eksisterende enrollment
      enrollment = await db.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: payload.passed ? "ATTENDED" : "CONFIRMED",
          notes: `Import fra Bransjekurs.no (${payload.externalId})${
            payload.certificateUrl ? `\nSertifikat: ${payload.certificateUrl}` : ""
          }`,
        },
      });
    } else {
      // Finn eller opprett en digital sesjon for dette kurset
      let session = await db.courseSession.findFirst({
        where: {
          courseId: course.id,
          status: "OPEN",
          variantId: {
            not: null, // Må ha variant
          },
        },
        include: {
          variant: true,
        },
      });

      // Hvis ingen sesjon finnes, opprett en "digital" sesjon
      if (!session) {
        // Finn eller opprett digital variant
        let digitalVariant = await db.courseVariant.findFirst({
          where: {
            courseId: course.id,
            type: "DIGITAL",
          },
        });

        if (!digitalVariant) {
          digitalVariant = await db.courseVariant.create({
            data: {
              courseId: course.id,
              type: "DIGITAL",
              price: course.price,
              description: "Digital gjennomføring via Bransjekurs.no",
            },
          });
        }

        // Opprett digital sesjon
        const completedDate = new Date(payload.completedAt);
        session = await db.courseSession.create({
          data: {
            courseId: course.id,
            variantId: digitalVariant.id,
            startsAt: completedDate,
            endsAt: completedDate,
            location: "Digital (Bransjekurs.no)",
            capacity: 999,
            status: "OPEN",
          },
          include: {
            variant: true,
          },
        });
      }

      // Opprett enrollment
      enrollment = await db.enrollment.create({
        data: {
          personId: person.id,
          sessionId: session.id,
          status: payload.passed ? "ATTENDED" : "CONFIRMED",
          notes: `Import fra Bransjekurs.no (${payload.externalId})${
            payload.certificateUrl ? `\nSertifikat: ${payload.certificateUrl}` : ""
          }`,
        },
      });
    }

    // Hvis bestått, opprett credential
    if (payload.passed) {
      // Sjekk om credential allerede eksisterer
      const existingCredential = await db.credential.findFirst({
        where: {
          personId: person.id,
          courseId: course.id,
        },
      });

      if (!existingCredential) {
        const credentialResult = await createCredential({
          personId: person.id,
          courseId: course.id,
          completedAt: new Date(payload.completedAt),
        });

        if (!credentialResult.success) {
          console.error("Feil ved opprett credential:", credentialResult.error);
        }
      }
    }

    // Opprett assessment hvis score er gitt
    if (payload.score !== undefined) {
      const existingAssessment = await db.assessment.findUnique({
        where: {
          sessionId_personId: {
            sessionId: enrollment.sessionId,
            personId: person.id,
          },
        },
      });

      if (!existingAssessment) {
        await db.assessment.create({
          data: {
            sessionId: enrollment.sessionId,
            personId: person.id,
            courseId: course.id,
            attended: true,
            attendanceTime: new Date(payload.completedAt),
            passed: payload.passed,
            score: payload.score,
            resultNotes: `Import fra Bransjekurs.no\nModuler: ${payload.modules?.join(", ") || "N/A"}`,
            assessedBy: "system", // System-generert
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Kursresultat importert",
      personId: person.id,
      enrollmentId: enrollment.id,
    });
  } catch (error) {
    console.error("Bransjekurs webhook feil:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Webhook feilet",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return webhook info
  return NextResponse.json({
    webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/bransjekurs`,
    description: "Bransjekurs.no webhook for import av digitale kursresultater",
    method: "POST",
    headers: {
      "x-api-key": "Required - set BRANSJEKURS_API_KEY in environment",
      "content-type": "application/json",
    },
    example: {
      externalId: "bk-12345",
      person: {
        firstName: "Ola",
        lastName: "Nordmann",
        email: "ola@example.com",
        phone: "12345678",
        birthDate: "1990-01-15",
      },
      courseCode: "YSK-001",
      completedAt: "2025-10-15T10:30:00Z",
      score: 85,
      passed: true,
      modules: ["Modul 1", "Modul 2", "Modul 3"],
      certificateUrl: "https://bransjekurs.no/certificate/12345",
    },
  });
}
