import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const policies = await db.validityPolicy.findMany({
      include: {
        renewalCourse: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, policies });
  } catch (error) {
    console.error("Fetch policies error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const policy = await db.validityPolicy.create({
      data: {
        name: data.name,
        kind: data.kind,
        years: data.years,
        graceDays: data.graceDays,
        renewalCourseId: data.renewalCourseId,
      },
    });

    return NextResponse.json({ success: true, policy });
  } catch (error) {
    console.error("Create policy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create policy" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const policy = await db.validityPolicy.update({
      where: { id: data.id },
      data: {
        name: data.name,
        kind: data.kind,
        years: data.years,
        graceDays: data.graceDays,
        renewalCourseId: data.renewalCourseId,
      },
    });

    return NextResponse.json({ success: true, policy });
  } catch (error) {
    console.error("Update policy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update policy" },
      { status: 500 }
    );
  }
}

