"use server";

import { db } from "@/lib/db";
import { getCrmSession, assertOwnership } from "@/lib/crm-guard";
import { dealSchema } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";

type DealActionResult =
  | { success: true; dealId: string; message: string }
  | { success: false; error: string };

export async function createDeal(formData: unknown): Promise<DealActionResult> {
  try {
    const session = await getCrmSession();
    const validatedData = dealSchema.parse(formData);

    // Instruktør kan bare opprette deals for seg selv
    const assignedToId = session.isAdmin
      ? (validatedData.assignedToId || null)
      : session.userId;

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
        assignedToId,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/admin/crm/deals");
    return { success: true, dealId: deal.id, message: "Avtale opprettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateDeal(id: string, formData: unknown): Promise<DealActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.deal.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!existing) return { success: false, error: "Avtale ikke funnet" };
    if (!assertOwnership(session, existing.assignedToId)) {
      return { success: false, error: "Du har ikke tilgang til å redigere denne avtalen" };
    }

    const validatedData = dealSchema.parse(formData);

    const assignedToId = session.isAdmin
      ? (validatedData.assignedToId || null)
      : session.userId;

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
        assignedToId,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/admin/crm/deals");
    return { success: true, dealId: deal.id, message: "Avtale oppdatert" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteDeal(id: string): Promise<DealActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.deal.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!existing) return { success: false, error: "Avtale ikke funnet" };
    if (!assertOwnership(session, existing.assignedToId)) {
      return { success: false, error: "Du har ikke tilgang til å slette denne avtalen" };
    }

    await db.deal.delete({ where: { id } });

    revalidatePath("/admin/crm/deals");
    return { success: true, dealId: id, message: "Avtale slettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateDealStage(
  id: string,
  stage: string
): Promise<DealActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.deal.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!existing) return { success: false, error: "Avtale ikke funnet" };
    if (!assertOwnership(session, existing.assignedToId)) {
      return { success: false, error: "Du har ikke tilgang til å oppdatere denne avtalen" };
    }

    const deal = await db.deal.update({
      where: { id },
      data: { stage: stage as any },
    });

    revalidatePath("/admin/crm/deals");
    revalidatePath("/admin/crm/dashboard");

    return { success: true, dealId: deal.id, message: "Stadie oppdatert" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function closeDeal(
  id: string,
  stage: "WON" | "LOST"
): Promise<DealActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.deal.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!existing) return { success: false, error: "Avtale ikke funnet" };
    if (!assertOwnership(session, existing.assignedToId)) {
      return { success: false, error: "Du har ikke tilgang til å lukke denne avtalen" };
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
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Kunne ikke lukke avtale" };
  }
}
