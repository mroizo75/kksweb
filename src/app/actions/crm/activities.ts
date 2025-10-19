"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { activitySchema, type ActivityInput } from "@/lib/validations/crm";
import { sendActivityEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

type ActivityActionResult =
  | { success: true; activityId: string; message: string }
  | { success: false; error: string };

export async function createActivity(
  formData: unknown & { sendNow?: boolean }
): Promise<ActivityActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const { sendNow, ...activityData } = formData as any;
    const validatedData = activitySchema.parse(activityData);

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
        assignedToId: validatedData.assignedToId || null,
        createdById: session.user.id,
        emailTo: validatedData.emailTo || null,
        emailFrom: validatedData.emailFrom || null,
      },
    });

    // Send e-post hvis type er EMAIL og sendNow er true
    if (validatedData.type === "EMAIL" && sendNow && validatedData.emailTo) {
      try {
        await sendActivityEmail({
          to: validatedData.emailTo,
          subject: validatedData.subject,
          content: validatedData.description || "",
          fromName: session.user.name || undefined,
        });

        // Oppdater activity med emailSentAt
        await db.activity.update({
          where: { id: activity.id },
          data: { emailSentAt: new Date() },
        });
      } catch (emailError) {
        console.error("Feil ved sending av e-post:", emailError);
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
    console.error("Feil ved opprett aktivitet:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateActivity(
  id: string,
  formData: unknown
): Promise<ActivityActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const validatedData = activitySchema.parse(formData);

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
        assignedToId: validatedData.assignedToId || null,
        emailTo: validatedData.emailTo || null,
        emailFrom: validatedData.emailFrom || null,
      },
    });

    revalidatePath("/admin/crm/activities");

    return {
      success: true,
      activityId: activity.id,
      message: "Aktivitet oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdater aktivitet:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteActivity(id: string): Promise<ActivityActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.activity.delete({
      where: { id },
    });

    revalidatePath("/admin/crm/activities");

    return {
      success: true,
      activityId: id,
      message: "Aktivitet slettet",
    };
  } catch (error) {
    console.error("Feil ved slett aktivitet:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function completeActivity(id: string): Promise<ActivityActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    const activity = await db.activity.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    revalidatePath("/admin/crm/activities");

    return {
      success: true,
      activityId: activity.id,
      message: "Aktivitet fullført",
    };
  } catch (error) {
    console.error("Feil ved fullfør aktivitet:", error);
    return { success: false, error: "Kunne ikke fullføre aktivitet" };
  }
}

