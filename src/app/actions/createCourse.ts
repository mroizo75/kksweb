"use server";

import { db } from "@/lib/db";
import { courseSchema, type CourseInput } from "@/lib/validations/course";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: unknown) {
  try {
    const validatedData = courseSchema.parse(formData);

    // Sjekk om slug allerede eksisterer
    const existingSlug = await db.course.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      return { success: false, error: "Slug er allerede i bruk" };
    }

    // Sjekk om code allerede eksisterer
    const existingCode = await db.course.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCode) {
      return { success: false, error: "Kurskode er allerede i bruk" };
    }

    const course = await db.course.create({
      data: validatedData,
    });

    revalidatePath("/admin/kurs");
    revalidatePath("/kurs");

    return {
      success: true,
      courseId: course.id,
    };
  } catch (error) {
    console.error("Feil ved opprett course:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function updateCourse(id: string, formData: unknown) {
  try {
    const validatedData = courseSchema.parse(formData);

    // Sjekk om slug brukes av et annet kurs
    const existingSlug = await db.course.findFirst({
      where: {
        slug: validatedData.slug,
        NOT: { id },
      },
    });

    if (existingSlug) {
      return { success: false, error: "Slug er allerede i bruk" };
    }

    // Sjekk om code brukes av et annet kurs
    const existingCode = await db.course.findFirst({
      where: {
        code: validatedData.code,
        NOT: { id },
      },
    });

    if (existingCode) {
      return { success: false, error: "Kurskode er allerede i bruk" };
    }

    const course = await db.course.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/admin/kurs");
    revalidatePath("/kurs");
    revalidatePath(`/kurs/${course.slug}`);

    return {
      success: true,
      courseId: course.id,
    };
  } catch (error) {
    console.error("Feil ved oppdater course:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

export async function deleteCourse(id: string) {
  try {
    // Sjekk om kurset har sesjoner
    const sessionsCount = await db.courseSession.count({
      where: { courseId: id },
    });

    if (sessionsCount > 0) {
      return {
        success: false,
        error: `Kan ikke slette kurs med ${sessionsCount} ${sessionsCount === 1 ? "sesjon" : "sesjoner"}`,
      };
    }

    await db.course.delete({
      where: { id },
    });

    revalidatePath("/admin/kurs");
    revalidatePath("/kurs");

    return { success: true };
  } catch (error) {
    console.error("Feil ved slett course:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "En uventet feil oppstod" };
  }
}

