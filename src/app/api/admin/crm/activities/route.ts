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
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const assignedToId = searchParams.get("assignedToId");

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    // Instruktør ser kun aktiviteter de er tildelt eller har opprettet
    if (!session.isAdmin) {
      where.OR = [
        { assignedToId: session.userId },
        { createdById: session.userId },
      ];
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    const activities = await db.activity.findMany({
      where,
      include: {
        lead: {
          select: { id: true, name: true },
        },
        deal: {
          select: { id: true, title: true },
        },
        company: {
          select: { id: true, name: true },
        },
        person: {
          select: { id: true, firstName: true, lastName: true },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Feil ved henting av activities:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente activities" },
      { status: 500 }
    );
  }
}
