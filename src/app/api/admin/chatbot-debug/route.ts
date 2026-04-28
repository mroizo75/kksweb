import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getCourseCategoryLabel } from "@/lib/course-categories";

export async function GET() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const courses = await db.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      price: true,
      published: true,
      sessions: {
        where: { startsAt: { gte: new Date() } },
        select: {
          id: true,
          status: true,
          startsAt: true,
          endsAt: true,
          location: true,
          capacity: true,
          _count: {
            select: {
              enrollments: { where: { status: { notIn: ["CANCELLED"] } } },
            },
          },
        },
        orderBy: { startsAt: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });

  const summary = courses.map((c) => ({
    title: c.title,
    slug: c.slug,
    category: c.category,
    categoryLabel: getCourseCategoryLabel(c.category),
    published: c.published,
    totalSessions: c.sessions.length,
    sessionsByStatus: c.sessions.reduce(
      (acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    nextSessions: c.sessions.slice(0, 3).map((s) => ({
      status: s.status,
      startsAt: s.startsAt,
      location: s.location,
      available: s.capacity - s._count.enrollments,
    })),
  }));

  return NextResponse.json({
    totalPublishedCourses: courses.length,
    courses: summary,
  });
}
