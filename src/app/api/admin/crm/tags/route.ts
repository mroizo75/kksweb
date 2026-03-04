import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const tags = await db.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { leads: true, companies: true, persons: true },
        },
      },
    });

    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
