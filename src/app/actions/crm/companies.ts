"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  orgNo: z.string().optional(),
  email: z.string().email("Ugyldig e-post").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

type CompanyInput = z.infer<typeof companySchema>;

type ActionResult =
  | { success: true; id: string; message: string }
  | { success: false; error: string };

export async function createCompany(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    const data = companySchema.parse(formData);

    const company = await db.company.create({
      data: {
        name: data.name,
        orgNo: data.orgNo || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        industry: data.industry || null,
        website: data.website || null,
        description: data.description || null,
      },
    });

    revalidatePath("/admin/crm/bedrifter");
    return { success: true, id: company.id, message: "Bedrift opprettet" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateCompany(id: string, formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    const data = companySchema.parse(formData);

    await db.company.update({
      where: { id },
      data: {
        name: data.name,
        orgNo: data.orgNo || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        industry: data.industry || null,
        website: data.website || null,
        description: data.description || null,
      },
    });

    revalidatePath("/admin/crm/bedrifter");
    revalidatePath(`/admin/crm/bedrifter/${id}`);
    return { success: true, id, message: "Bedrift oppdatert" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    await db.company.delete({ where: { id } });

    revalidatePath("/admin/crm/bedrifter");
    return { success: true, id, message: "Bedrift slettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}
