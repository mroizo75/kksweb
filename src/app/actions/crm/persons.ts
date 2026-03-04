"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const personSchema = z.object({
  firstName: z.string().min(1, "Fornavn er påkrevd"),
  lastName: z.string().min(1, "Etternavn er påkrevd"),
  email: z.string().email("Ugyldig e-post").optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  companyId: z.string().optional(),
});

type ActionResult =
  | { success: true; id: string; message: string }
  | { success: false; error: string };

export async function createPerson(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    const data = personSchema.parse(formData);

    const person = await db.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        title: data.title || null,
        linkedinUrl: data.linkedinUrl || null,
        address: data.address || null,
        postalCode: data.postalCode || null,
        city: data.city || null,
        companyId: data.companyId || null,
      },
    });

    revalidatePath("/admin/crm/kontakter");
    return { success: true, id: person.id, message: "Kontaktperson opprettet" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updatePerson(id: string, formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    const data = personSchema.parse(formData);

    await db.person.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        title: data.title || null,
        linkedinUrl: data.linkedinUrl || null,
        address: data.address || null,
        postalCode: data.postalCode || null,
        city: data.city || null,
        companyId: data.companyId || null,
      },
    });

    revalidatePath("/admin/crm/kontakter");
    revalidatePath(`/admin/crm/kontakter/${id}`);
    return { success: true, id, message: "Kontaktperson oppdatert" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deletePerson(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    await db.person.delete({ where: { id } });

    revalidatePath("/admin/crm/kontakter");
    return { success: true, id, message: "Kontaktperson slettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}
