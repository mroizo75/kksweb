"use server";

import { db } from "@/lib/db";
import { getCrmSession, assertOwnership } from "@/lib/crm-guard";
import { activitySchema } from "@/lib/validations/crm";
import { sendActivityEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

type ActivityActionResult =
  | { success: true; activityId: string; message: string }
  | { success: false; error: string };

export async function createActivity(
  formData: unknown & { sendNow?: boolean }
): Promise<ActivityActionResult> {
  try {
    const session = await getCrmSession();
    const { sendNow, ...activityData } = formData as any;
    const validatedData = activitySchema.parse(activityData);

    // Instruktør kan bare tildele aktiviteter til seg selv
    const assignedToId = session.isAdmin
      ? (validatedData.assignedToId || null)
      : session.userId;

    const activity = await db.activity.create({
      data: {
        type: validatedData.type as any,
        subject: validatedData.subject,
        description: validatedData.description || null,
        status: validatedData.status as any,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        leadId: validatedData.leadId || null,
        dealId: validatedData.dealId || null,
        companyId: validatedData.companyId || null,
        personId: validatedData.personId || null,
        assignedToId,
        createdById: session.userId,
        emailTo: validatedData.emailTo || null,
        emailFrom: validatedData.emailFrom || null,
      },
    });

    if (validatedData.type === "EMAIL" && sendNow && validatedData.emailTo) {
      try {
        await sendActivityEmail({
          to: validatedData.emailTo,
          subject: validatedData.subject,
          content: validatedData.description || "",
          fromName: undefined,
        });

        await db.activity.update({
          where: { id: activity.id },
          data: { emailSentAt: new Date() },
        });
      } catch {
        // Fortsett selv om e-post feiler
      }
    }

    revalidatePath("/admin/crm/activities");
    return {
      success: true,
      activityId: activity.id,
      message: sendNow && validatedData.type === "EMAIL" ? "E-post sendt" : "Aktivitet opprettet",
    };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateActivity(
  id: string,
  formData: unknown
): Promise<ActivityActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.activity.findUnique({
      where: { id },
      select: { assignedToId: true, createdById: true },
    });
    if (!existing) return { success: false, error: "Aktivitet ikke funnet" };

    // Instruktør kan redigere aktiviteter de er tildelt eller har opprettet
    const hasAccess =
      session.isAdmin ||
      existing.assignedToId === session.userId ||
      existing.createdById === session.userId;
    if (!hasAccess) {
      return { success: false, error: "Du har ikke tilgang til å redigere denne aktiviteten" };
    }

    const validatedData = activitySchema.parse(formData);

    const assignedToId = session.isAdmin
      ? (validatedData.assignedToId || null)
      : session.userId;

    const activity = await db.activity.update({
      where: { id },
      data: {
        type: validatedData.type as any,
        subject: validatedData.subject,
        description: validatedData.description || null,
        status: validatedData.status as any,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        leadId: validatedData.leadId || null,
        dealId: validatedData.dealId || null,
        companyId: validatedData.companyId || null,
        personId: validatedData.personId || null,
        assignedToId,
        emailTo: validatedData.emailTo || null,
        emailFrom: validatedData.emailFrom || null,
      },
    });

    revalidatePath("/admin/crm/activities");
    return { success: true, activityId: activity.id, message: "Aktivitet oppdatert" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteActivity(id: string): Promise<ActivityActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.activity.findUnique({
      where: { id },
      select: { assignedToId: true, createdById: true },
    });
    if (!existing) return { success: false, error: "Aktivitet ikke funnet" };

    const hasAccess =
      session.isAdmin ||
      existing.assignedToId === session.userId ||
      existing.createdById === session.userId;
    if (!hasAccess) {
      return { success: false, error: "Du har ikke tilgang til å slette denne aktiviteten" };
    }

    await db.activity.delete({ where: { id } });

    revalidatePath("/admin/crm/activities");
    return { success: true, activityId: id, message: "Aktivitet slettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function completeActivity(id: string): Promise<ActivityActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.activity.findUnique({
      where: { id },
      select: { assignedToId: true, createdById: true },
    });
    if (!existing) return { success: false, error: "Aktivitet ikke funnet" };

    const hasAccess =
      session.isAdmin ||
      existing.assignedToId === session.userId ||
      existing.createdById === session.userId;
    if (!hasAccess) {
      return { success: false, error: "Du har ikke tilgang til å fullføre denne aktiviteten" };
    }

    const activity = await db.activity.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    revalidatePath("/admin/crm/activities");
    return { success: true, activityId: activity.id, message: "Aktivitet fullført" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Kunne ikke fullføre aktivitet" };
  }
}
