import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

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

    // Validering
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-post og passord er påkrevd" },
        { status: 400 }
      );
    }

    // Sjekk om bruker allerede eksisterer
    const existingUser = await db.user.findUnique({
      where: { email },
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
        email,
        name: name || email.split("@")[0],
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
    return NextResponse.json(
      { error: "Kunne ikke hente brukere" },
      { status: 500 }
    );
  }
}

