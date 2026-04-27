import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCrmSession, withOwnerScope } from "@/lib/crm-guard";

export async function GET(request: Request) {
  try {
    const session = await getCrmSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");

    let where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    // Admin kan filtrere på hvem som helst; instruktør er låst til seg selv
    if (!session.isAdmin) {
      where.assignedToId = session.userId;
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { companyName: { contains: search } },
      ];
    }

    const leads = await db.lead.findMany({
      where,
      include: {
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

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Feil ved henting av leads:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente leads" },
      { status: 500 }
    );
  }
}
