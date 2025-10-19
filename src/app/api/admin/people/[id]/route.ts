import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    const person = await db.person.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        address: data.address || null,
        postalCode: data.postalCode || null,
        city: data.city || null,
        profileImage: data.profileImage || null,
      },
    });

    return NextResponse.json({ success: true, person });
  } catch (error) {
    console.error("Update person error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update person" },
      { status: 500 }
    );
  }
}

