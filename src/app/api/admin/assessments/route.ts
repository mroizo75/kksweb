import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    const assessments = await db.assessment.findMany({
      where: sessionId ? { sessionId } : undefined,
      include: {
        person: true,
        course: true,
        session: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { attendanceTime: "desc" },
    });

    return NextResponse.json({ success: true, assessments });
  } catch (error) {
    console.error("Fetch assessments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessments" },
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

    // Get courseId from session
    const courseSession = await db.courseSession.findUnique({
      where: { id: data.sessionId },
      select: { courseId: true },
    });

    if (!courseSession) {
      return NextResponse.json(
        { success: false, error: "Sesjon ikke funnet" },
        { status: 404 }
      );
    }

    const assessment = await db.assessment.create({
      data: {
        sessionId: data.sessionId,
        personId: data.personId,
        courseId: courseSession.courseId,
        attended: data.attended,
        attendanceTime: data.attendanceTime ? new Date(data.attendanceTime) : new Date(),
        passed: data.passed ?? null,
        score: data.score ?? null,
        resultNotes: data.resultNotes || null,
        assessedBy: data.assessedBy || session.user?.name || null,
      },
    });

    return NextResponse.json({ success: true, assessment });
  } catch (error) {
    console.error("Create assessment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create assessment" },
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

    const assessment = await db.assessment.update({
      where: { id: data.id },
      data: {
        attended: data.attended,
        attendanceTime: data.attendanceTime ? new Date(data.attendanceTime) : undefined,
        passed: data.passed ?? null,
        score: data.score ?? null,
        resultNotes: data.resultNotes || null,
        assessedBy: data.assessedBy || session.user?.name || null,
      },
    });

    return NextResponse.json({ success: true, assessment });
  } catch (error) {
    console.error("Update assessment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

