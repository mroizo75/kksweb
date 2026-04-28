import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") return null;
  return session;
}

const createSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Ugyldig e-post"),
  password: z.string().min(8, "Passord må være minst 8 tegn"),
  role: z.enum(["ADMIN", "INSTRUCTOR"]),
});

const updateSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Ugyldig e-post"),
  role: z.enum(["ADMIN", "INSTRUCTOR"]),
  password: z.string().min(8).optional().or(z.literal("")),
});

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

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

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

    const body = await req.json();
    const data = createSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: "E-posten er allerede i bruk" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

    const { id, ...body } = await req.json();
    if (!id) return NextResponse.json({ error: "ID mangler" }, { status: 400 });

    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      role: data.role,
    };

    if (data.password) {
      updateData.hashedPassword = await bcrypt.hash(data.password, 12);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID mangler" }, { status: 400 });

    const currentUserId = (session.user as any).id;
    if (id === currentUserId) {
      return NextResponse.json({ error: "Du kan ikke slette din egen bruker" }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
