import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await db.template.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Fetch templates error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
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

    const template = await db.template.create({
      data: {
        name: data.name,
        kind: data.kind,
        description: data.description || null,
        fileKey: data.fileKey || "default-template.pdf",
        variables: {},
        active: true,
        version: 1,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
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

    const template = await db.template.update({
      where: { id: data.id },
      data: {
        name: data.name,
        kind: data.kind,
        description: data.description || null,
        fileKey: data.fileKey || "default-template.pdf",
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Update template error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update template" },
      { status: 500 }
    );
  }
}

