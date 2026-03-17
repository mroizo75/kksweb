import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { courseSchema } from "@/lib/validations/course";
import { isMissingColumnError } from "@/lib/prisma-compat";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await db.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        code: true,
        category: true,
        description: true,
        durationDays: true,
        price: true,
        image: true,
        published: true,
        validityYears: true,
        learningOutcomes: true,
        targetAudience: true,
        priceIncludes: true,
        bookingAddOns: true,
        createdAt: true,
        updatedAt: true,
        validityPolicyId: true,
        _count: {
          select: {
            sessions: true,
          },
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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = courseSchema.parse(body);
    const normalizedData = {
      ...validatedData,
      bookingAddOns: validatedData.bookingAddOns ?? [],
    };

    const existingSlug = await db.course.findUnique({
      where: { slug: normalizedData.slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Slug er allerede i bruk" },
        { status: 409 }
      );
    }

    const existingCode = await db.course.findUnique({
      where: { code: normalizedData.code },
    });
    if (existingCode) {
      return NextResponse.json(
        { success: false, error: "Kurskode er allerede i bruk" },
        { status: 409 }
      );
    }

    const course = await (async () => {
      try {
        return await db.course.create({ data: normalizedData });
      } catch (error) {
        if (!isMissingColumnError(error, ["bookingAddOns"])) {
          throw error;
        }
        const { bookingAddOns, ...legacyData } = normalizedData;
        return db.course.create({ data: legacyData });
      }
    })();

    revalidatePath("/admin/kurs");
    revalidatePath("/kurs");

    return NextResponse.json({ success: true, courseId: course.id });
  } catch (error) {
    console.error("Feil ved opprett course:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "En uventet feil oppstod" },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Mangler kurs-ID" },
        { status: 400 }
      );
    }

    const validatedData = courseSchema.parse(body.data);
    const normalizedData = {
      ...validatedData,
      bookingAddOns: validatedData.bookingAddOns ?? [],
    };

    const existingSlug = await db.course.findFirst({
      where: { slug: normalizedData.slug, NOT: { id } },
    });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Slug er allerede i bruk" },
        { status: 409 }
      );
    }

    const existingCode = await db.course.findFirst({
      where: { code: normalizedData.code, NOT: { id } },
    });
    if (existingCode) {
      return NextResponse.json(
        { success: false, error: "Kurskode er allerede i bruk" },
        { status: 409 }
      );
    }

    const course = await (async () => {
      try {
        return await db.course.update({
          where: { id },
          data: normalizedData,
        });
      } catch (error) {
        if (!isMissingColumnError(error, ["bookingAddOns"])) {
          throw error;
        }
        const { bookingAddOns, ...legacyData } = normalizedData;
        return db.course.update({
          where: { id },
          data: legacyData,
        });
      }
    })();

    revalidatePath("/admin/kurs");
    revalidatePath("/kurs");
    revalidatePath(`/kurs/${course.slug}`);

    return NextResponse.json({ success: true, courseId: course.id });
  } catch (error) {
    console.error("Feil ved oppdater course:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "En uventet feil oppstod" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Mangler kurs-ID" },
        { status: 400 }
      );
    }

    const sessionsCount = await db.courseSession.count({
      where: { courseId: id },
    });

    if (sessionsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Kan ikke slette kurs med ${sessionsCount} ${sessionsCount === 1 ? "sesjon" : "sesjoner"}`,
        },
        { status: 409 }
      );
    }

    await db.course.delete({
      where: { id },
    });

    revalidatePath("/admin/kurs");
    revalidatePath("/kurs");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feil ved slett course:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "En uventet feil oppstod" },
      { status: 400 }
    );
  }
}

