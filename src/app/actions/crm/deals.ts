"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { dealSchema, type DealInput } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";

type DealActionResult =
  | { success: true; dealId: string; message: string }
  | { success: false; error: string };

export async function createDeal(formData: unknown): Promise<DealActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const validatedData = dealSchema.parse(formData);

    const deal = await db.deal.create({
      data: {
        title: validatedData.title,
        companyId: validatedData.companyId || null,
        personId: validatedData.personId || null,
        value: validatedData.value,
        stage: validatedData.stage as any,
        probability: validatedData.probability,
        expectedCloseDate: validatedData.expectedCloseDate
          ? new Date(validatedData.expectedCloseDate)
          : null,
        assignedToId: validatedData.assignedToId || null,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/admin/crm/deals");

    return {
      success: true,
      dealId: deal.id,
      message: "Avtale opprettet",
    };
  } catch (error) {
    console.error("Feil ved opprett avtale:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateDeal(id: string, formData: unknown): Promise<DealActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const validatedData = dealSchema.parse(formData);

    const deal = await db.deal.update({
      where: { id },
      data: {
        title: validatedData.title,
        companyId: validatedData.companyId || null,
        personId: validatedData.personId || null,
        value: validatedData.value,
        stage: validatedData.stage as any,
        probability: validatedData.probability,
        expectedCloseDate: validatedData.expectedCloseDate
          ? new Date(validatedData.expectedCloseDate)
          : null,
        assignedToId: validatedData.assignedToId || null,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/admin/crm/deals");

    return {
      success: true,
      dealId: deal.id,
      message: "Avtale oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdater avtale:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteDeal(id: string): Promise<DealActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.deal.delete({
      where: { id },
    });

    revalidatePath("/admin/crm/deals");

    return {
      success: true,
      dealId: id,
      message: "Avtale slettet",
    };
  } catch (error) {
    console.error("Feil ved slett avtale:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function closeDeal(
  id: string,
  stage: "WON" | "LOST"
): Promise<DealActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const deal = await db.deal.update({
      where: { id },
      data: {
        stage,
        closedAt: new Date(),
        probability: stage === "WON" ? 100 : 0,
      },
    });

    revalidatePath("/admin/crm/deals");

    return {
      success: true,
      dealId: deal.id,
      message: stage === "WON" ? "Avtale vunnet!" : "Avtale tapt",
    };
  } catch (error) {
    console.error("Feil ved lukk avtale:", error);
    return { success: false, error: "Kunne ikke lukke avtale" };
  }
}

