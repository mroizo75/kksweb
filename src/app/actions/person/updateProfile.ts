"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  error?: string;
};

type UpdateProfileInput = {
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
};

export async function updatePersonProfile(
  data: UpdateProfileInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Verifiser at brukeren har tilgang til å oppdatere denne personen
    const person = await db.person.findUnique({
      where: { id: data.personId },
    });

    if (!person) {
      return { success: false, error: "Person ikke funnet" };
    }

    if (person.email !== session.user.email) {
      return { success: false, error: "Ikke tilgang" };
    }

    // Oppdater person
    await db.person.update({
      where: { id: data.personId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
      },
    });

    revalidatePath("/min-side");
    revalidatePath("/min-side/profil");

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke oppdatere profil",
    };
  }
}

