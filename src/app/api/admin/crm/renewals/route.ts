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
    const days = searchParams.get("days");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (days) {
      const daysNumber = parseInt(days);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysNumber);

      where.dueDate = {
        lte: futureDate,
        gte: new Date(),
      };
    }

    const renewals = await db.renewalTask.findMany({
      where,
      include: {
        person: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
        credential: {
          select: { id: true, validFrom: true, validTo: true },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 100,
    });

    return NextResponse.json({ renewals });
  } catch (error) {
    console.error("Feil ved henting av renewals:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente renewals" },
      { status: 500 }
    );
  }
}

