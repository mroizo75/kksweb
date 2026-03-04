import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const companies = await db.company.findMany({
      include: {
        _count: {
          select: {
            people: true,
            deals: true,
            activities: true,
          },
        },
        deals: {
          where: { stage: { notIn: ["WON", "LOST"] } },
          select: { value: true },
        },
        tags: { include: { tag: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ companies });
  } catch {
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
