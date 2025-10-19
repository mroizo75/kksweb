import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const companyId = searchParams.get("companyId");

    const licenses = await db.license.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(companyId && { companyId }),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            orgNo: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(licenses);
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

