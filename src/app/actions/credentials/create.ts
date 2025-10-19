"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calculateValidity, generateCredentialCode } from "@/lib/validity";
import { revalidatePath } from "next/cache";

type CredentialActionResult =
  | { success: true; credentialId: string; message: string }
  | { success: false; error: string };

export interface CreateCredentialInput {
  personId: string;
  courseId: string;
  completedAt: Date;
  type?: "DOCUMENTED" | "CERTIFIED" | "TEMPORARY";
  competenceCodes?: string[];
  assessmentId?: string;
}

/**
 * Opprett kompetansebevis etter fullført kurs
 */
export async function createCredential(
  input: CreateCredentialInput
): Promise<CredentialActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const { personId, courseId, completedAt, type = "DOCUMENTED", competenceCodes = [], assessmentId } = input;

    // Hent course med validity policy
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { validityPolicy: true },
    });

    if (!course) {
      return { success: false, error: "Kurs ikke funnet" };
    }

    // Sjekk om person eksisterer
    const person = await db.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      return { success: false, error: "Person ikke funnet" };
    }

    // Beregn gyldighetsperiode
    const { validFrom, validTo } = calculateValidity({
      completedAt,
      policy: course.validityPolicy,
    });

    // Generer unik kode
    const code = generateCredentialCode();

    // Opprett credential
    const credential = await db.credential.create({
      data: {
        personId,
        courseId,
        code,
        validFrom,
        validTo,
        policyId: course.validityPolicyId,
        type,
        competenceCodes: competenceCodes.length > 0 ? competenceCodes : [],
        status: "ACTIVE",
      },
    });

    revalidatePath("/admin/credentials");
    revalidatePath("/admin/kunder");

    return {
      success: true,
      credentialId: credential.id,
      message: "Kompetansebevis opprettet",
    };
  } catch (error) {
    console.error("Feil ved opprett credential:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

/**
 * Slett credential (kun for admin)
 */
export async function deleteCredential(id: string): Promise<CredentialActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Sjekk om credential har dokumenter eller kort
    const credential = await db.credential.findUnique({
      where: { id },
      include: {
        _count: {
          select: { documents: true, cards: true },
        },
      },
    });

    if (!credential) {
      return { success: false, error: "Kompetansebevis ikke funnet" };
    }

    if (credential._count.documents > 0 || credential._count.cards > 0) {
      return {
        success: false,
        error: "Kan ikke slette kompetansebevis med tilknyttede dokumenter eller kort",
      };
    }

    await db.credential.delete({
      where: { id },
    });

    revalidatePath("/admin/credentials");

    return {
      success: true,
      credentialId: id,
      message: "Kompetansebevis slettet",
    };
  } catch (error) {
    console.error("Feil ved slett credential:", error);
    return { success: false, error: "Kunne ikke slette kompetansebevis" };
  }
}

