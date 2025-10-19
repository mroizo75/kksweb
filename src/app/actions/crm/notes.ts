"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { noteSchema, type NoteInput } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";

type NoteActionResult =
  | { success: true; noteId: string; message: string }
  | { success: false; error: string };

export async function createNote(formData: unknown): Promise<NoteActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const validatedData = noteSchema.parse(formData);

    // Valider at minst én relasjon er satt
    if (
      !validatedData.leadId &&
      !validatedData.dealId &&
      !validatedData.companyId &&
      !validatedData.personId
    ) {
      return { success: false, error: "Notat må være knyttet til en entitet" };
    }

    const note = await db.note.create({
      data: {
        content: validatedData.content,
        leadId: validatedData.leadId || null,
        dealId: validatedData.dealId || null,
        companyId: validatedData.companyId || null,
        personId: validatedData.personId || null,
        createdById: session.user.id,
      },
    });

    // Revalidate relevante paths
    if (validatedData.leadId) revalidatePath("/admin/crm/leads");
    if (validatedData.dealId) revalidatePath("/admin/crm/deals");
    if (validatedData.companyId) revalidatePath("/admin/kunder");
    if (validatedData.personId) revalidatePath("/admin/kunder");

    return {
      success: true,
      noteId: note.id,
      message: "Notat opprettet",
    };
  } catch (error) {
    console.error("Feil ved opprett notat:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteNote(id: string): Promise<NoteActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const note = await db.note.findUnique({
      where: { id },
    });

    if (!note) {
      return { success: false, error: "Notat ikke funnet" };
    }

    // Sjekk om brukeren har tilgang (kun skaperen kan slette)
    if (note.createdById !== session.user.id) {
      // Kun admin eller notatskaperen kan slette
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      
      if (user?.role !== "ADMIN") {
        return { success: false, error: "Du har ikke tilgang til å slette dette notatet" };
      }
    }

    await db.note.delete({
      where: { id },
    });

    // Revalidate relevante paths
    if (note.leadId) revalidatePath("/admin/crm/leads");
    if (note.dealId) revalidatePath("/admin/crm/deals");
    if (note.companyId) revalidatePath("/admin/kunder");
    if (note.personId) revalidatePath("/admin/kunder");

    return {
      success: true,
      noteId: id,
      message: "Notat slettet",
    };
  } catch (error) {
    console.error("Feil ved slett notat:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

