import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }

    const licenses = await db.productLicense.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            domain: true,
          },
        },
        _count: {
          select: {
            validationLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error("Error fetching product licenses:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente produktlisenser" },
      { status: 500 }
    );
  }
}

