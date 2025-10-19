import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instructors = await db.user.findMany({
      where: {
        role: { in: ["INSTRUCTOR", "ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ instructors });
  } catch (error) {
    console.error("Feil ved henting av instruktører:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente instruktører" },
      { status: 500 }
    );
  }
}

