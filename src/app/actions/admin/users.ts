"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") throw new Error("Ingen tilgang");
  return session;
}

const createSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Ugyldig e-post"),
  password: z.string().min(8, "Passord må være minst 8 tegn"),
  role: z.enum(["ADMIN", "INSTRUCTOR"]),
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Ugyldig e-post"),
  role: z.enum(["ADMIN", "INSTRUCTOR"]),
  password: z.string().min(8).optional().or(z.literal("")),
});

type UserActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function getUsers() {
  await requireAdmin();
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { courseOrders: true, leads: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));
}

export async function createUser(formData: unknown): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const data = createSchema.parse(formData);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) return { success: false, error: "E-posten er allerede i bruk" };

    const hashedPassword = await bcrypt.hash(data.password, 12);
    await db.user.create({
      data: { name: data.name, email: data.email, hashedPassword, role: data.role },
    });

    revalidatePath("/admin/brukere");
    return { success: true, message: "Bruker opprettet" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateUser(formData: unknown): Promise<UserActionResult> {
  try {
    await requireAdmin();
    const data = updateSchema.parse(formData);

    const updateData: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      role: data.role,
    };
    if (data.password) {
      updateData.hashedPassword = await bcrypt.hash(data.password, 12);
    }

    await db.user.update({ where: { id: data.id }, data: updateData });
    revalidatePath("/admin/brukere");
    return { success: true, message: "Bruker oppdatert" };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message };
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteUser(id: string): Promise<UserActionResult> {
  try {
    const session = await requireAdmin();
    const currentUserId = (session.user as any).id as string;
    if (id === currentUserId) {
      return { success: false, error: "Du kan ikke slette din egen bruker" };
    }
    await db.user.delete({ where: { id } });
    revalidatePath("/admin/brukere");
    return { success: true, message: "Bruker slettet" };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "En uventet feil oppstod" };
  }
}
