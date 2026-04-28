import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCrmSession } from "@/lib/crm-guard";

export async function GET() {
  try {
    const session = await getCrmSession().catch(() => null);
    if (!session) return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });

    const where = session.isAdmin ? {} : { instructorId: session.userId };

    const orders = await db.courseOrder.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, orgNo: true } },
        person: { select: { id: true, firstName: true, lastName: true, email: true } },
        instructor: { select: { id: true, name: true } },
        courses: { include: { course: { select: { id: true, title: true, code: true } } } },
        participants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
