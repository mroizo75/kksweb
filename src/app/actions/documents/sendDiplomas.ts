"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateDiplomaPdf } from "@/lib/pdf-generator";
import { sendDiplomaEmail } from "@/lib/email";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export interface DiplomaParticipant {
  name: string;
  email: string;
}

export interface SendDiplomasInput {
  templateId: string;
  courseName: string;
  completedDate: string;
  instructorOverride?: string;
  participants: DiplomaParticipant[];
}

export interface SendDiplomasResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: { name: string; email: string; error: string }[];
}

export async function sendDiplomas(
  input: SendDiplomasInput
): Promise<SendDiplomasResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, sent: 0, failed: 0, errors: [] };
  }

  const { templateId, courseName, completedDate, instructorOverride, participants } = input;
  const completedAt = new Date(completedDate);

  const template = await db.template.findUnique({
    where: { id: templateId },
    select: { diplomaBodyText: true, diplomaInstructor: true },
  });

  const bodyText = template?.diplomaBodyText ?? undefined;
  const instructor = instructorOverride?.trim() || template?.diplomaInstructor || undefined;

  const errors: { name: string; email: string; error: string }[] = [];
  let sent = 0;

  for (const participant of participants) {
    if (!participant.email) {
      errors.push({ name: participant.name, email: "", error: "Mangler e-postadresse" });
      continue;
    }

    try {
      const pdfBytes = await generateDiplomaPdf({
        personName: participant.name,
        courseName,
        completedDate: completedAt,
        bodyText,
        instructor,
      });

      await sendDiplomaEmail({
        personName: participant.name,
        email: participant.email,
        courseName,
        completedDate: format(completedAt, "dd. MMMM yyyy", { locale: nb }),
        pdfBytes,
      });

      sent++;
    } catch (error) {
      errors.push({
        name: participant.name,
        email: participant.email,
        error: error instanceof Error ? error.message : "Ukjent feil ved sending",
      });
    }
  }

  return { success: errors.length === 0, sent, failed: errors.length, errors };
}
