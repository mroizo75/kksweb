"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z.object({
  toEmail: z.string().email("Ugyldig e-postadresse"),
  subject: z.string().min(1, "Emne er påkrevd"),
  body: z.string().min(1, "Melding er påkrevd"),
  leadId: z.string().optional(),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
  personId: z.string().optional(),
});

type EmailInput = z.infer<typeof emailSchema>;

type ActionResult =
  | { success: true; id: string; message: string }
  | { success: false; error: string };

export async function sendCrmEmail(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    const data = emailSchema.parse(formData);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "KKS <post@kksas.no>";
    const senderName = (session.user as any).name || "KKS";

    let status = "SENT";
    try {
      await resend.emails.send({
        from: fromEmail,
        replyTo: (session.user as any).email || undefined,
        to: [data.toEmail],
        subject: data.subject,
        text: data.body,
      });
    } catch {
      status = "FAILED";
    }

    const emailLog = await db.emailLog.create({
      data: {
        subject: data.subject,
        body: data.body,
        toEmail: data.toEmail,
        fromEmail,
        status,
        leadId: data.leadId || null,
        dealId: data.dealId || null,
        companyId: data.companyId || null,
        personId: data.personId || null,
        sentById: session.user.id,
      },
    });

    if (data.companyId) revalidatePath(`/admin/crm/bedrifter/${data.companyId}`);
    if (data.personId) revalidatePath(`/admin/crm/kontakter/${data.personId}`);

    if (status === "FAILED") {
      return { success: false, error: "E-post ble logget, men sending feilet" };
    }

    return { success: true, id: emailLog.id, message: "E-post sendt og logget" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function logEmailOnly(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Ikke autentisert" };

    const data = emailSchema.parse(formData);

    const emailLog = await db.emailLog.create({
      data: {
        subject: data.subject,
        body: data.body,
        toEmail: data.toEmail,
        fromEmail: (session.user as any).email || "ukjent",
        status: "LOGGED",
        leadId: data.leadId || null,
        dealId: data.dealId || null,
        companyId: data.companyId || null,
        personId: data.personId || null,
        sentById: session.user.id,
      },
    });

    if (data.companyId) revalidatePath(`/admin/crm/bedrifter/${data.companyId}`);
    if (data.personId) revalidatePath(`/admin/crm/kontakter/${data.personId}`);

    return { success: true, id: emailLog.id, message: "E-post logget" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}
