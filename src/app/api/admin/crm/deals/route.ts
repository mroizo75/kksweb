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
    const stage = searchParams.get("stage");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");

    const where: any = {};

    if (stage) {
      where.stage = stage;
    }

    if (assignedToId) {
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

