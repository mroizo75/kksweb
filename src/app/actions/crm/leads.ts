"use server";

import { db } from "@/lib/db";
import { getCrmSession, assertOwnership } from "@/lib/crm-guard";
import { leadSchema } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";

type LeadActionResult =
  | { success: true; leadId: string; message: string }
  | { success: false; error: string };

export async function createLead(formData: unknown): Promise<LeadActionResult> {
  try {
    const session = await getCrmSession();
    const validatedData = leadSchema.parse(formData);

    // Instruktør kan bare opprette leads for seg selv
    const assignedToId = session.isAdmin
      ? (validatedData.assignedToId || null)
      : session.userId;

    const lead = await db.lead.create({
      data: {
        source: validatedData.source || null,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        companyName: validatedData.companyName || null,
        status: validatedData.status as any,
        assignedToId,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/admin/crm/leads");
    return { success: true, leadId: lead.id, message: "Lead opprettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateLead(id: string, formData: unknown): Promise<LeadActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.lead.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!existing) return { success: false, error: "Lead ikke funnet" };
    if (!assertOwnership(session, existing.assignedToId)) {
      return { success: false, error: "Du har ikke tilgang til å redigere denne leaden" };
    }

    const validatedData = leadSchema.parse(formData);

    // Instruktør kan ikke flytte lead til en annen bruker
    const assignedToId = session.isAdmin
      ? (validatedData.assignedToId || null)
      : session.userId;

    const lead = await db.lead.update({
      where: { id },
      data: {
        source: validatedData.source || null,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        companyName: validatedData.companyName || null,
        status: validatedData.status as any,
        assignedToId,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/admin/crm/leads");
    return { success: true, leadId: lead.id, message: "Lead oppdatert" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteLead(id: string): Promise<LeadActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.lead.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!existing) return { success: false, error: "Lead ikke funnet" };
    if (!assertOwnership(session, existing.assignedToId)) {
      return { success: false, error: "Du har ikke tilgang til å slette denne leaden" };
    }

    await db.lead.delete({ where: { id } });

    revalidatePath("/admin/crm/leads");
    return { success: true, leadId: id, message: "Lead slettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function convertLeadToDeal(leadId: string, dealTitle?: string): Promise<{
  success: boolean;
  dealId?: string;
  error?: string;
}> {
  try {
    const session = await getCrmSession();

    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { success: false, error: "Lead ikke funnet" };
    if (!assertOwnership(session, lead.assignedToId)) {
      return { success: false, error: "Du har ikke tilgang til denne leaden" };
    }

    const deal = await db.deal.create({
      data: {
        title: dealTitle || `Deal fra ${lead.name}`,
        value: 0,
        stage: "QUALIFIED",
        probability: 50,
        assignedToId: lead.assignedToId,
        notes: lead.notes,
      },
    });

    await db.lead.update({
      where: { id: leadId },
      data: { status: "CONVERTED" },
    });

    revalidatePath("/admin/crm/leads");
    revalidatePath("/admin/crm/deals");

    return { success: true, dealId: deal.id };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Kunne ikke konvertere lead" };
  }
}
