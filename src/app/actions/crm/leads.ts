"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { leadSchema, type LeadInput } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";

type LeadActionResult =
  | { success: true; leadId: string; message: string }
  | { success: false; error: string };

export async function createLead(formData: unknown): Promise<LeadActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const validatedData = leadSchema.parse(formData);

    const lead = await db.lead.create({
      data: {
        source: validatedData.source || null,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        companyName: validatedData.companyName || null,
        status: validatedData.status as any,
        assignedToId: validatedData.assignedToId || null,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/admin/crm/leads");

    return {
      success: true,
      leadId: lead.id,
      message: "Lead opprettet",
    };
  } catch (error) {
    console.error("Feil ved opprett lead:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateLead(id: string, formData: unknown): Promise<LeadActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const validatedData = leadSchema.parse(formData);

    const lead = await db.lead.update({
      where: { id },
      data: {
        source: validatedData.source || null,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        companyName: validatedData.companyName || null,
        status: validatedData.status as any,
        assignedToId: validatedData.assignedToId || null,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/admin/crm/leads");

    return {
      success: true,
      leadId: lead.id,
      message: "Lead oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdater lead:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteLead(id: string): Promise<LeadActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.lead.delete({
      where: { id },
    });

    revalidatePath("/admin/crm/leads");

    return {
      success: true,
      leadId: id,
      message: "Lead slettet",
    };
  } catch (error) {
    console.error("Feil ved slett lead:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function convertLeadToDeal(leadId: string, dealTitle?: string): Promise<{
  success: boolean;
  dealId?: string;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { success: false, error: "Lead ikke funnet" };
    }

    // Opprett Deal fra Lead
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

    // Oppdater lead status til CONVERTED
    await db.lead.update({
      where: { id: leadId },
      data: { status: "CONVERTED" },
    });

    revalidatePath("/admin/crm/leads");
    revalidatePath("/admin/crm/deals");

    return {
      success: true,
      dealId: deal.id,
    };
  } catch (error) {
    console.error("Feil ved konverter lead:", error);
    return { success: false, error: "Kunne ikke konvertere lead" };
  }
}

