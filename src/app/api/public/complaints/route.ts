import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const customerComplaintSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  category: z.enum(["COURSE", "SERVICE", "DOCUMENTATION", "EQUIPMENT", "INSTRUCTOR", "OTHER"]),
  title: z.string().min(3),
  description: z.string().min(20),
  occurredAt: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Valider input
    const validated = customerComplaintSchema.parse(body);

    // Generer NC-nummer
    const year = new Date().getFullYear();
    const prefix = `NC-${year}-`;
    
    const lastNc = await db.qmsNonConformance.findFirst({
      where: {
        ncNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        ncNumber: "desc",
      },
    });

    let nextNumber = 1;
    if (lastNc) {
      const lastNumber = parseInt(lastNc.ncNumber.split("-")[2]);
      nextNumber = lastNumber + 1;
    }

    const ncNumber = `${prefix}${String(nextNumber).padStart(3, "0")}`;

    // Map kategori til NcCategory
    const categoryMap: Record<string, any> = {
      COURSE: "PRODUCT",
      SERVICE: "PROCESS",
      DOCUMENTATION: "DOCUMENTATION",
      EQUIPMENT: "EQUIPMENT",
      INSTRUCTOR: "PERSONNEL",
      OTHER: "OTHER",
    };

    // Finn en default bruker (f.eks første ADMIN)
    const defaultUser = await db.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!defaultUser) {
      return NextResponse.json(
        { error: "System ikke konfigurert riktig" },
        { status: 500 }
      );
    }

    // Opprett avvik som kundeklage
    const nc = await db.qmsNonConformance.create({
      data: {
        ncNumber,
        type: "CUSTOMER",
        severity: "MAJOR", // Default for kundeklager
        category: categoryMap[validated.category],
        title: validated.title,
        description: `
**Kundeinformasjon:**
Navn: ${validated.name}
E-post: ${validated.email}
${validated.phone ? `Telefon: ${validated.phone}` : ""}
${validated.company ? `Bedrift: ${validated.company}` : ""}

**Beskrivelse:**
${validated.description}
        `.trim(),
        detectedAt: new Date(validated.occurredAt),
        status: "OPEN",
        priority: 1, // Høy prioritet for kundeklager
        reportedBy: defaultUser.id,
        attachments: {
          customerEmail: validated.email,
          customerName: validated.name,
          customerPhone: validated.phone,
          customerCompany: validated.company,
        },
      },
    });

    // TODO: Send e-post til kvalitetsansvarlig

    return NextResponse.json({
      success: true,
      ncNumber,
      message: "Klage mottatt",
    });
  } catch (error) {
    console.error("Error creating complaint:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Kunne ikke opprette klage" },
      { status: 500 }
    );
  }
}

