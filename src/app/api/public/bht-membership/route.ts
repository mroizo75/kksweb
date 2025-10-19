import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const bhtMembershipSchema = z.object({
  companyName: z.string().min(2),
  orgNumber: z.string().optional(),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  numberOfEmployees: z.string().optional(),
  message: z.string().optional(),
  gdprConsent: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Valider input
    const validated = bhtMembershipSchema.parse(body);

    if (!validated.gdprConsent) {
      return NextResponse.json(
        { success: false, error: "GDPR-samtykke må godtas" },
        { status: 400 }
      );
    }

    // Opprett Lead i CRM
    const lead = await db.lead.create({
      data: {
        source: "BHT_MEDLEM",
        name: validated.contactName,
        email: validated.email,
        phone: validated.phone,
        companyName: validated.companyName,
        status: "NEW",
        notes: [
          `Org.nr: ${validated.orgNumber || "Ikke oppgitt"}`,
          `Antall ansatte: ${validated.numberOfEmployees || "Ikke oppgitt"}`,
          validated.message ? `Melding: ${validated.message}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    // TODO: Send e-post til admin (valgfritt)
    // TODO: Send bekreftelse til kunde (valgfritt)

    return NextResponse.json({
      success: true,
      message: "Påmelding mottatt",
      leadId: lead.id,
    });
  } catch (error) {
    console.error("Error creating BHT membership lead:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Ugyldig input" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Kunne ikke opprette påmelding" },
      { status: 500 }
    );
  }
}

