"use server";

import { db } from "@/lib/db";
import { generateDocument, generateQRCode } from "@/lib/pdf-generator";
import { addDays } from "date-fns";

interface GenerateTemporaryResult {
  success: boolean;
  documentUrl?: string;
  error?: string;
}

/**
 * Generer midlertidig bevis (gyldig i 14 dager)
 * Kalles automatisk når en enrollment opprettes
 */
export async function generateTemporaryDocument(
  enrollmentId: string
): Promise<GenerateTemporaryResult> {
  try {
    // Hent enrollment med alle relasjoner
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
      return { success: false, error: "Enrollment ikke funnet" };
    }

    // Finn TEMP_CERT template
    const template = await db.template.findFirst({
      where: {
        kind: "TEMP_CERT",
        active: true,
      },
    });

    if (!template) {
      console.warn("Ingen aktiv TEMP_CERT template funnet, hopper over generering");
      return { success: true }; // Ikke kritisk feil
    }

    // Generer QR-kode for verifisering (bruker enrollment ID)
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify/temp/${enrollment.id}`;
    const qrCodeDataUrl = await generateQRCode(verifyUrl);

    // Beregn gyldighetsperiode (14 dager fra nå)
    const validFrom = new Date();
    const validTo = addDays(validFrom, 14);

    // Generer PDF (midlertidig implementasjon - returner buffer direkte)
    // TODO: Implementer template-basert PDF-generering med S3/R2
    const pdfBuffer = Buffer.from("PDF placeholder for temp cert");

    // Lagre dokument i database
    const document = await db.document.create({
      data: {
        templateId: template.id,
        enrollmentId: enrollment.id,
        fileKey: `temp-certs/${enrollment.id}.pdf`,
        metadata: {
          kind: "TEMP_CERT",
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          birthDate: enrollment.person.birthDate?.toISOString(),
          personName: `${enrollment.person.firstName} ${enrollment.person.lastName}`,
          courseName: enrollment.session.course.title,
        },
        generatedBy: "system",
      },
    });

    // TODO: Last opp til S3/R2
    // For nå returnerer vi bare en placeholder URL
    const documentUrl = `/api/documents/${document.id}/download`;

    console.log(`Midlertidig bevis generert for enrollment ${enrollmentId}`);

    return {
      success: true,
      documentUrl,
    };
  } catch (error) {
    console.error("Feil ved generering av midlertidig bevis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

