import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await db.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      sessions: {
        where: {
          status: { in: ["OPEN", "DRAFT"] },
          startsAt: { gte: new Date() },
        },
        select: {
          id: true,
          startsAt: true,
          location: true,
          capacity: true,
          _count: {
            select: {
              enrollments: {
                where: { status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] } },
              },
            },
          },
        },
        orderBy: { startsAt: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });

  const formatted = courses
    .filter((c) => c.sessions.length > 0)
    .map((c) => ({
      id: c.id,
      title: c.title,
      sessions: c.sessions.map((s) => ({
        id: s.id,
        startsAt: s.startsAt,
        location: s.location,
        capacity: s.capacity,
        enrollmentCount: s._count.enrollments,
      })),
    }));

  return NextResponse.json({ courses: formatted });
}
