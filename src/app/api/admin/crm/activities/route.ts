import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const assignedToId = searchParams.get("assignedToId");

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (assignedToId) {
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

