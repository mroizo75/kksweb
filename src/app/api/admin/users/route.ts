import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { isMissingColumnError } from "@/lib/prisma-compat";

function getDbSyncErrorMessage(error: unknown): string | null {
  if (isMissingColumnError(error, ["twoFactor", "backupCodes", "users"])) {
    return "Database er ikke synkronisert med kodebasen. Kjør: npx prisma db push";
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  ) {
    return "Mangler tabell i databasen. Kjør: npx prisma db push";
  }

  return null;
}

/**
 * POST /api/admin/users - Opprett admin bruker (kun for initial setup)
 * 
 * Body:
 * {
 *   "email": "admin@kks.no",
 *   "password": "hemmelig123",
 *   "name": "Admin Bruker",
 *   "role": "ADMIN"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    // Validering
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "E-post og passord er påkrevd" },
        { status: 400 }
      );
    }

    // Sjekk om bruker allerede eksisterer
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bruker med denne e-posten eksisterer allerede" },
        { status: 400 }
      );
    }

    // Hash passord
    const hashedPassword = await hash(password, 12);

    // Opprett bruker
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name:
          (typeof name === "string" && name.trim().length > 0
            ? name.trim()
            : normalizedEmail.split("@")[0]),
        hashedPassword,
        role: role === "ADMIN" ? "ADMIN" : "INSTRUCTOR",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bruker opprettet",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    const syncMessage = getDbSyncErrorMessage(error);
    if (syncMessage) {
      return NextResponse.json({ error: syncMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Kunne ikke opprette bruker" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users - Hent alle brukere (for administrasjon)
 */
export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    const syncMessage = getDbSyncErrorMessage(error);
    if (syncMessage) {
      return NextResponse.json({ error: syncMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Kunne ikke hente brukere" },
      { status: 500 }
    );
  }
}

