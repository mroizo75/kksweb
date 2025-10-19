import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const published = searchParams.get("published") !== "false";

    const courses = await db.course.findMany({
      where: {
        ...(category && { category }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { code: { contains: search } },
          ],
        }),
        published,
      },
      include: {
        sessions: {
          where: {
            startsAt: { gte: new Date() },
            status: { in: ["OPEN", "DRAFT"] },
          },
          orderBy: { startsAt: "asc" },
          take: 1,
        },
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Feil ved henting av kurs:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente kurs" },
      { status: 500 }
    );
  }
}

