"use server";

import { z } from "zod";
import { sendCourseRequest } from "@/lib/email";
import { checkFormRateLimit, getServerActionIp } from "@/lib/rate-limit";

const schema = z.object({
  courseName: z.string().min(1),
  courseSlug: z.string().min(1),
  name: z.string().min(2, "Skriv inn fullt navn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().min(8, "Skriv inn telefonnummer"),
  preferredDate: z.string().min(1, "Oppgi ønsket dato eller periode"),
  participants: z.string().min(1, "Oppgi antall deltakere"),
  message: z.string().optional(),
});

export async function requestCourse(formData: unknown) {
  const ip = await getServerActionIp();
  const limit = checkFormRateLimit(ip, "course-request");
  if (!limit.allowed) {
    return { success: false, error: limit.message };
  }

  const parsed = schema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ugyldig skjema",
    };
  }

  try {
    await sendCourseRequest(parsed.data);
    return { success: true };
  } catch {
    return { success: false, error: "Klarte ikke å sende forespørselen. Prøv igjen eller ring oss." };
  }
}
