"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(1, "Bedriftsnavn er påkrevd"),
  orgNo: z.string().optional(),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function createCompany(data: z.infer<typeof companySchema>) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ikke autorisert" };
    }

    // Valider input
    const validatedData = companySchema.parse(data);

    // Sjekk om bedrift med samme org.nr allerede eksisterer
    if (validatedData.orgNo) {
      const existing = await db.company.findUnique({
        where: { orgNo: validatedData.orgNo },
      });

      if (existing) {
        return {
          success: false,
          error: "En bedrift med dette organisasjonsnummeret eksisterer allerede",
        };
      }
    }

    // Opprett bedrift
    const company = await db.company.create({
      data: {
        name: validatedData.name,
        orgNo: validatedData.orgNo || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
      },
    });

    return { success: true, company };
  } catch (error) {
    console.error("Error creating company:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    return { success: false, error: "Kunne ikke opprette bedrift" };
  }
}

export async function updateCompany(
  companyId: string,
  data: z.infer<typeof companySchema>
) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ikke autorisert" };
    }

    // Valider input
    const validatedData = companySchema.parse(data);

    // Sjekk om bedrift med samme org.nr allerede eksisterer (unntatt nåværende)
    if (validatedData.orgNo) {
      const existing = await db.company.findFirst({
        where: {
          orgNo: validatedData.orgNo,
          NOT: { id: companyId },
        },
      });

      if (existing) {
        return {
          success: false,
          error: "En annen bedrift med dette organisasjonsnummeret eksisterer allerede",
        };
      }
    }

    // Oppdater bedrift
    const company = await db.company.update({
      where: { id: companyId },
      data: {
        name: validatedData.name,
        orgNo: validatedData.orgNo || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
      },
    });

    return { success: true, company };
  } catch (error) {
    console.error("Error updating company:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    return { success: false, error: "Kunne ikke oppdatere bedrift" };
  }
}

