"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const personSchema = z.object({
  firstName: z.string().min(1, "Fornavn er påkrevd"),
  lastName: z.string().min(1, "Etternavn er påkrevd"),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  companyId: z.string().optional(),
});

export async function createPerson(data: z.infer<typeof personSchema>) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ikke autorisert" };
    }

    // Valider input
    const validatedData = personSchema.parse(data);

    // Opprett person
    const person = await db.person.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        postalCode: validatedData.postalCode || null,
        city: validatedData.city || null,
        companyId: validatedData.companyId || null,
      },
    });

    return { success: true, person };
  } catch (error) {
    console.error("Error creating person:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    return { success: false, error: "Kunne ikke opprette deltaker" };
  }
}

export async function updatePerson(
  personId: string,
  data: z.infer<typeof personSchema>
) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ikke autorisert" };
    }

    // Valider input
    const validatedData = personSchema.parse(data);

    // Oppdater person
    const person = await db.person.update({
      where: { id: personId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        postalCode: validatedData.postalCode || null,
        city: validatedData.city || null,
        companyId: validatedData.companyId || null,
      },
    });

    return { success: true, person };
  } catch (error) {
    console.error("Error updating person:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    return { success: false, error: "Kunne ikke oppdatere deltaker" };
  }
}

