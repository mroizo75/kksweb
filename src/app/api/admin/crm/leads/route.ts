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
    const status = searchParams.get("status");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (assignedToId) {
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

