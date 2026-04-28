"use server";

import { db } from "@/lib/db";
import { getCrmSession, assertOwnership } from "@/lib/crm-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const participantSchema = z.object({
  firstName: z.string().min(1, "Fornavn er påkrevd"),
  lastName: z.string().min(1, "Etternavn er påkrevd"),
  email: z.string().email("Ugyldig e-post").optional().or(z.literal("")),
  phone: z.string().optional(),
});

const orderSchema = z.object({
  customerType: z.enum(["COMPANY", "PERSON"]),
  companyId: z.string().optional(),
  personId: z.string().optional(),
  courseIds: z.array(z.string()).min(1, "Velg minst ett kurs"),
  participants: z.array(participantSchema).min(1, "Legg til minst én deltaker"),
  agreedPrice: z.number().min(0, "Pris kan ikke være negativ"),
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "INVOICED", "CANCELLED"]).default("DRAFT"),
});

type OrderActionResult =
  | { success: true; orderId: string; message: string }
  | { success: false; error: string };

export async function createOrder(formData: unknown): Promise<OrderActionResult> {
  try {
    const session = await getCrmSession();
    const data = orderSchema.parse(formData);

    if (data.customerType === "COMPANY" && !data.companyId) {
      return { success: false, error: "Velg en bedrift" };
    }
    if (data.customerType === "PERSON" && !data.personId) {
      return { success: false, error: "Velg en person" };
    }

    const order = await db.courseOrder.create({
      data: {
        companyId: data.customerType === "COMPANY" ? data.companyId : null,
        personId: data.customerType === "PERSON" ? data.personId : null,
        agreedPrice: data.agreedPrice,
        notes: data.notes || null,
        status: data.status,
        instructorId: session.userId,
        courses: {
          create: data.courseIds.map((courseId) => ({ courseId })),
        },
        participants: {
          create: data.participants.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email || null,
            phone: p.phone || null,
          })),
        },
      },
    });

    revalidatePath("/admin/bestillinger");
    return { success: true, orderId: order.id, message: "Bestilling opprettet" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateOrderStatus(
  id: string,
  status: "DRAFT" | "CONFIRMED" | "INVOICED" | "CANCELLED"
): Promise<OrderActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.courseOrder.findUnique({
      where: { id },
      select: { instructorId: true },
    });
    if (!existing) return { success: false, error: "Bestilling ikke funnet" };
    if (!assertOwnership(session, existing.instructorId)) {
      return { success: false, error: "Ingen tilgang" };
    }

    await db.courseOrder.update({ where: { id }, data: { status } });
    revalidatePath("/admin/bestillinger");
    revalidatePath(`/admin/bestillinger/${id}`);
    return { success: true, orderId: id, message: "Status oppdatert" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteOrder(id: string): Promise<OrderActionResult> {
  try {
    const session = await getCrmSession();

    const existing = await db.courseOrder.findUnique({
      where: { id },
      select: { instructorId: true },
    });
    if (!existing) return { success: false, error: "Bestilling ikke funnet" };
    if (!assertOwnership(session, existing.instructorId)) {
      return { success: false, error: "Ingen tilgang" };
    }

    await db.courseOrder.delete({ where: { id } });
    revalidatePath("/admin/bestillinger");
    return { success: true, orderId: id, message: "Bestilling slettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}
