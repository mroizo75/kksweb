import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "all";
    const period = searchParams.get("period") ?? "upcoming";

    const where: Prisma.CourseSessionWhereInput = {};

    if (period === "upcoming") {
      where.startsAt = { gte: new Date() };
    } else if (period === "past") {
      where.startsAt = { lt: new Date() };
    }

    if (status !== "all") {
      where.status = status as Prisma.EnumSessionStatusFilter;
    }

    if (search) {
      where.OR = [
        { course: { title: { contains: search } } },
        { location: { contains: search } },
        { instructor: { name: { contains: search } } },
      ];
    }

    const [total, sessions] = await Promise.all([
      db.courseSession.count({ where }),
      db.courseSession.findMany({
        where,
        include: {
          course: true,
          instructor: { select: { name: true } },
          _count: {
            select: {
              enrollments: {
                where: { status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] } },
              },
            },
          },
        },
        orderBy: { startsAt: period === "past" ? "desc" : "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return NextResponse.json({
      sessions,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("Feil ved henting av sesjoner:", error);
    return NextResponse.json({ error: "Kunne ikke hente sesjoner" }, { status: 500 });
  }
}

