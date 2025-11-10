import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await db.facebookCampaign.findMany({
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
        insights: {
          orderBy: { date: "desc" },
          take: 30, // Siste 30 dager
        },
        optimizationLogs: {
          where: { implemented: false },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            adSets: true,
            insights: true,
            optimizationLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

