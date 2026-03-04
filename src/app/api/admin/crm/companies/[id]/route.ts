import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const { id } = await params;

    const company = await db.company.findUnique({
      where: { id },
      include: {
        people: {
          orderBy: { firstName: "asc" },
          include: {
            tags: { include: { tag: true } },
            _count: { select: { credentials: true, deals: true } },
          },
        },
        contacts: { orderBy: { firstName: "asc" } },
        deals: {
          orderBy: { updatedAt: "desc" },
          include: {
            assignedTo: { select: { id: true, name: true } },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            assignedTo: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
        emailLogs: {
          orderBy: { sentAt: "desc" },
          take: 20,
          include: {
            sentBy: { select: { id: true, name: true } },
          },
        },
        tags: { include: { tag: true } },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Bedrift ikke funnet" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch {
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
