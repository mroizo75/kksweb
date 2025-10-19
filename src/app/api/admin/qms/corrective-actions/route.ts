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
    const ncId = searchParams.get("ncId");
    const status = searchParams.get("status");
    const responsibleUser = searchParams.get("responsibleUser");

    // Bygg where-filter
    const where: any = {};

    if (ncId) {
      where.ncId = ncId;
    }

    if (status) {
      where.status = status;
    }

    if (responsibleUser) {
      where.responsibleUser = responsibleUser;
    }

    // Hent tiltak
    const actions = await db.qmsCorrectiveAction.findMany({
      where,
      include: {
        nonConformance: {
          select: {
            id: true,
            ncNumber: true,
            title: true,
            status: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        verifier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error("Error fetching corrective actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch corrective actions" },
      { status: 500 }
    );
  }
}

