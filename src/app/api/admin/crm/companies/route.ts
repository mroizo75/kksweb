import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCrmSession, ownerFilter } from "@/lib/crm-guard";

export async function GET() {
  try {
    const session = await getCrmSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const companies = await db.company.findMany({
      where: ownerFilter(session, "ownerId"),
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
