"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateDocument } from "@/lib/pdf-generator";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

type DocumentActionResult =
  | { success: true; documentId: string; message: string; fileKey?: string }
  | { success: false; error: string };

export interface GenerateDocumentInput {
  credentialId: string;
  templateKind: "DIPLOMA" | "TEMP_CERT" | "CERTIFICATE";
  completedAt: Date;
  location?: string;
  instructor?: string;
}

/**
 * Generer dokument (PDF) fra credential
 */
export async function generateDocumentForCredential(
  input: GenerateDocumentInput
): Promise<DocumentActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const { credentialId, templateKind, completedAt, location, instructor } = input;

    // Hent credential med person og course
    const credential = await db.credential.findUnique({
      where: { id: credentialId },
      include: {
        person: true,
        course: true,
      },
    });

    if (!credential) {
      return { success: false, error: "Kompetansebevis ikke funnet" };
    }

    // Finn active template for den gitte kind
    const template = await db.template.findFirst({
      where: {
        kind: templateKind,
        active: true,
      },
      orderBy: {
        version: "desc",
      },
    });

    if (!template) {
      return {
        success: false,
        error: `Ingen aktiv mal funnet for ${templateKind}`,
      };
    }

    // Bygg payload
    const payload = {
      person: {
        firstName: credential.person.firstName,
        lastName: credential.person.lastName,
        birthDate: credential.person.birthDate,
        email: credential.person.email,
        phone: credential.person.phone,
        address: credential.person.address,
        profileImage: credential.person.profileImage,
      },
      course: {
        title: credential.course.title,
        code: credential.course.code,
        category: credential.course.category,
        durationDays: credential.course.durationDays,
      },
      credential: {
        code: credential.code,
        validFrom: credential.validFrom,
        validTo: credential.validTo,
        type: credential.type,
        competenceCodes: credential.competenceCodes,
      },
      completedAt,
      location,
      instructor,
    };

    // Generer PDF
    const pdfBytes = await generateDocument(
      template as any, // Type casting for simplicity
      payload
    );

    // Lagre PDF til disk (i prod: bruk S3/R2)
    const uploadsDir = join(process.cwd(), "uploads", "documents");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${credential.code}-${Date.now()}.pdf`;
    const filepath = join(uploadsDir, filename);
    const fileKey = `documents/${filename}`;

    await writeFile(filepath, pdfBytes);

    // Opprett Document i database
    const document = await db.document.create({
      data: {
        templateId: template.id,
        credentialId: credential.id,
        fileKey,
        metadata: payload as any,
        generatedBy: session.user.id,
      },
    });

    revalidatePath("/admin/credentials");
    revalidatePath(`/admin/kunder`);

    return {
      success: true,
      documentId: document.id,
      fileKey,
      message: "Dokument generert",
    };
  } catch (error) {
    console.error("Feil ved generering av dokument:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

/**
 * Generer dokument direkte fra enrollment
 */
export async function generateDocumentFromEnrollment(
  enrollmentId: string,
  templateKind: "DIPLOMA" | "TEMP_CERT" | "CERTIFICATE"
): Promise<DocumentActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Hent enrollment
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        person: true,
        session: {
          include: {
            course: true,
            instructor: true,
          },
        },
      },
    });

    if (!enrollment) {
      return { success: false, error: "Påmelding ikke funnet" };
    }

    if (enrollment.status !== "ATTENDED" && enrollment.status !== "CONFIRMED") {
      return {
        success: false,
        error: "Kun påmeldinger med status ATTENDED eller CONFIRMED kan få generert dokument",
      };
    }

    // Sjekk om credential allerede eksisterer
    let credential = await db.credential.findFirst({
      where: {
        personId: enrollment.personId,
        courseId: enrollment.session.courseId,
      },
    });

    // Hvis ikke, opprett credential
    if (!credential) {
      const { createCredential } = await import("../credentials/create");
      const result = await createCredential({
        personId: enrollment.personId,
        courseId: enrollment.session.courseId,
        completedAt: new Date(),
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      credential = await db.credential.findUnique({
        where: { id: result.credentialId },
      });

      if (!credential) {
        return { success: false, error: "Kunne ikke opprette credential" };
      }
    }

    // Generer dokument
    return await generateDocumentForCredential({
      credentialId: credential.id,
      templateKind,
      completedAt: new Date(),
      location: enrollment.session.location,
      instructor: enrollment.session.instructor?.name || undefined,
    });
  } catch (error) {
    console.error("Feil ved generering av dokument fra enrollment:", error);
    return { success: false, error: "Kunne ikke generere dokument" };
  }
}

