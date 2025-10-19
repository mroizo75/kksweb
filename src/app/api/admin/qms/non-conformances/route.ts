import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const search = searchParams.get("search") || "";

    // Bygg where-filter
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    if (search) {
      where.OR = [
        { ncNumber: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Hent avvik
    const nonConformances = await db.qmsNonConformance.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        correctiveActions: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: {
        detectedAt: "desc",
      },
    });

    return NextResponse.json(nonConformances);
  } catch (error) {
    console.error("Error fetching non-conformances:", error);
    return NextResponse.json(
      { error: "Failed to fetch non-conformances" },
      { status: 500 }
    );
  }
}

