"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd").max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ugyldig farge"),
});

type ActionResult =
  | { success: true; id: string; message: string }
  | { success: false; error: string };

export async function createTag(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    const data = tagSchema.parse(formData);

    const tag = await db.tag.create({ data });
    return { success: true, id: tag.id, message: "Tag opprettet" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    await db.tag.delete({ where: { id } });
    return { success: true, id, message: "Tag slettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function assignTagsToLead(
  leadId: string,
  tagIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    await db.leadTag.deleteMany({ where: { leadId } });
    if (tagIds.length > 0) {
      await db.leadTag.createMany({
        data: tagIds.map((tagId) => ({ leadId, tagId })),
        skipDuplicates: true,
      });
    }

    revalidatePath("/admin/crm/leads");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function assignTagsToCompany(
  companyId: string,
  tagIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    await db.companyTag.deleteMany({ where: { companyId } });
    if (tagIds.length > 0) {
      await db.companyTag.createMany({
        data: tagIds.map((tagId) => ({ companyId, tagId })),
        skipDuplicates: true,
      });
    }

    revalidatePath("/admin/crm/bedrifter");
    revalidatePath(`/admin/crm/bedrifter/${companyId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function assignTagsToPerson(
  personId: string,
  tagIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    await db.personTag.deleteMany({ where: { personId } });
    if (tagIds.length > 0) {
      await db.personTag.createMany({
        data: tagIds.map((tagId) => ({ personId, tagId })),
        skipDuplicates: true,
      });
    }

    revalidatePath("/admin/crm/kontakter");
    revalidatePath(`/admin/crm/kontakter/${personId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}
