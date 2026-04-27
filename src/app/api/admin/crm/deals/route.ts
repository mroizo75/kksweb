import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCrmSession } from "@/lib/crm-guard";

export async function GET(request: Request) {
  try {
    const session = await getCrmSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (stage) {
      where.stage = stage;
    }

    // Admin kan filtrere på hvem som helst; instruktør er låst til seg selv
    if (!session.isAdmin) {
      where.assignedToId = session.userId;
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const deals = await db.deal.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true },
        },
        person: {
          select: { id: true, firstName: true, lastName: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { activities: true, notesList: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ deals });
  } catch (error) {
    console.error("Feil ved henting av deals:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente deals" },
      { status: 500 }
    );
  }
}
