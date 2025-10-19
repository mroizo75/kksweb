"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  qmsDocumentSchema,
  updateQmsDocumentSchema,
  type QmsDocumentInput,
  type UpdateQmsDocumentInput,
} from "@/lib/validations/qms";

type ActionResult =
  | { success: true; documentId?: string; message: string }
  | { success: false; error: string };

/**
 * Opprett nytt QMS-dokument
 */
export async function createQmsDocument(
  data: QmsDocumentInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = qmsDocumentSchema.parse(data);

    // Sjekk om dokumentnummer allerede eksisterer
    const existing = await db.qmsDocument.findUnique({
      where: { documentNo: validated.documentNo },
    });

    if (existing) {
      return {
        success: false,
        error: `Dokumentnummer ${validated.documentNo} eksisterer allerede`,
      };
    }

    // Opprett dokument
    const document = await db.qmsDocument.create({
      data: {
        documentNo: validated.documentNo,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        version: validated.version,
        status: "DRAFT",
        effectiveDate: validated.effectiveDate
          ? new Date(validated.effectiveDate)
          : null,
        reviewDate: validated.reviewDate
          ? new Date(validated.reviewDate)
          : null,
        fileKey: validated.fileKey,
        ownerId: validated.ownerId,
        createdBy: session.user.id,
      },
    });

    revalidatePath("/admin/kvalitet/dokumenter");

    return {
      success: true,
      documentId: document.id,
      message: `Dokument ${validated.documentNo} opprettet`,
    };
  } catch (error) {
    console.error("Feil ved opprettelse av dokument:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke opprette dokument" };
  }
}

/**
 * Oppdater eksisterende dokument
 */
export async function updateQmsDocument(
  data: UpdateQmsDocumentInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = updateQmsDocumentSchema.parse(data);

    // Hent eksisterende dokument
    const existing = await db.qmsDocument.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: "Dokument ikke funnet" };
    }

    // Oppdater
    await db.qmsDocument.update({
      where: { id: validated.id },
      data: {
        ...(validated.documentNo && { documentNo: validated.documentNo }),
        ...(validated.title && { title: validated.title }),
        ...(validated.description !== undefined && {
          description: validated.description,
        }),
        ...(validated.category && { category: validated.category }),
        ...(validated.version && { version: validated.version }),
        ...(validated.status && { status: validated.status }),
        ...(validated.effectiveDate !== undefined && {
          effectiveDate: validated.effectiveDate
            ? new Date(validated.effectiveDate)
            : null,
        }),
        ...(validated.reviewDate !== undefined && {
          reviewDate: validated.reviewDate
            ? new Date(validated.reviewDate)
            : null,
        }),
        ...(validated.ownerId && { ownerId: validated.ownerId }),
        ...(validated.approvedBy !== undefined && {
          approvedBy: validated.approvedBy,
        }),
        ...(validated.approvedAt !== undefined && {
          approvedAt: validated.approvedAt
            ? new Date(validated.approvedAt)
            : null,
        }),
      },
    });

    revalidatePath("/admin/kvalitet/dokumenter");
    revalidatePath(`/admin/kvalitet/dokumenter/${validated.id}`);

    return {
      success: true,
      message: "Dokument oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdatering av dokument:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke oppdatere dokument" };
  }
}

/**
 * Godkjenn dokument (endre status)
 */
export async function approveQmsDocument(
  documentId: string,
  approve: boolean
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const document = await db.qmsDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Dokument ikke funnet" };
    }

    if (approve) {
      // Godkjenn
      await db.qmsDocument.update({
        where: { id: documentId },
        data: {
          status: "APPROVED",
          approvedBy: session.user.id,
          approvedAt: new Date(),
        },
      });

      revalidatePath("/admin/kvalitet/dokumenter");
      revalidatePath(`/admin/kvalitet/dokumenter/${documentId}`);

      return { success: true, message: "Dokument godkjent" };
    } else {
      // Avvis - send tilbake til draft
      await db.qmsDocument.update({
        where: { id: documentId },
        data: {
          status: "DRAFT",
          approvedBy: null,
          approvedAt: null,
        },
      });

      revalidatePath("/admin/kvalitet/dokumenter");
      revalidatePath(`/admin/kvalitet/dokumenter/${documentId}`);

      return { success: true, message: "Dokument sendt tilbake til utkast" };
    }
  } catch (error) {
    console.error("Feil ved godkjenning:", error);
    return { success: false, error: "Kunne ikke godkjenne dokument" };
  }
}

/**
 * Aktiver dokument (sett til EFFECTIVE)
 */
export async function activateQmsDocument(
  documentId: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const document = await db.qmsDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Dokument ikke funnet" };
    }

    if (document.status !== "APPROVED") {
      return {
        success: false,
        error: "Kun godkjente dokumenter kan aktiveres",
      };
    }

    await db.qmsDocument.update({
      where: { id: documentId },
      data: {
        status: "EFFECTIVE",
        effectiveDate: new Date(),
      },
    });

    revalidatePath("/admin/kvalitet/dokumenter");
    revalidatePath(`/admin/kvalitet/dokumenter/${documentId}`);

    return { success: true, message: "Dokument aktivert" };
  } catch (error) {
    console.error("Feil ved aktivering:", error);
    return { success: false, error: "Kunne ikke aktivere dokument" };
  }
}

/**
 * Arkiver dokument
 */
export async function archiveQmsDocument(
  documentId: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.qmsDocument.update({
      where: { id: documentId },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    revalidatePath("/admin/kvalitet/dokumenter");
    revalidatePath(`/admin/kvalitet/dokumenter/${documentId}`);

    return { success: true, message: "Dokument arkivert" };
  } catch (error) {
    console.error("Feil ved arkivering:", error);
    return { success: false, error: "Kunne ikke arkivere dokument" };
  }
}

/**
 * Slett dokument
 */
export async function deleteQmsDocument(
  documentId: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const document = await db.qmsDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Dokument ikke funnet" };
    }

    // Kun DRAFT-dokumenter kan slettes
    if (document.status !== "DRAFT") {
      return {
        success: false,
        error: "Kun utkast kan slettes. Aktive dokumenter må arkiveres.",
      };
    }

    await db.qmsDocument.delete({
      where: { id: documentId },
    });

    revalidatePath("/admin/kvalitet/dokumenter");

    return { success: true, message: "Dokument slettet" };
  } catch (error) {
    console.error("Feil ved sletting:", error);
    return { success: false, error: "Kunne ikke slette dokument" };
  }
}

