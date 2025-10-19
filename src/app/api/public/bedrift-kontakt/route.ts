import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendBedriftKontaktConfirmation, sendBedriftKontaktNotification } from "@/lib/email";

const bedriftKontaktSchema = z.object({
  companyName: z.string().min(1, "Bedriftsnavn er påkrevd"),
  orgNo: z.string().optional(),
  contactPerson: z.string().min(1, "Kontaktperson er påkrevd"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().min(1, "Telefon er påkrevd"),
  employees: z.string().min(1, "Antall ansatte er påkrevd"),
  courseType: z.string().min(1, "Kurstype er påkrevd"),
  message: z.string().optional(),
  gdprConsent: z.boolean().refine((val) => val === true, {
    message: "GDPR-samtykke er påkrevd",
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = bedriftKontaktSchema.parse(body);

    // Opprett Lead i CRM
    const lead = await db.lead.create({
      data: {
        name: validated.contactPerson,
        email: validated.email,
        phone: validated.phone,
        companyName: validated.companyName,
        source: "BEDRIFT_KONTAKT",
        status: "NEW",
        notes: `
Organisasjonsnummer: ${validated.orgNo || "Ikke oppgitt"}
Antall ansatte: ${validated.employees}
Ønsket kurs: ${validated.courseType}
Melding: ${validated.message || "Ingen melding"}

GDPR-samtykke gitt: ${new Date().toISOString()}
        `.trim(),
      },
    });

    // Send bekreftelse til kunden
    try {
      await sendBedriftKontaktConfirmation({
        companyName: validated.companyName,
        contactPerson: validated.contactPerson,
        email: validated.email,
        phone: validated.phone,
        employees: validated.employees,
        courseType: validated.courseType,
        message: validated.message,
      });
    } catch (emailError) {
      console.error("Kunne ikke sende bekreftelse til kunde:", emailError);
      // Fortsett selv om e-post feiler
    }

    // Send notifikasjon til admin
    try {
      await sendBedriftKontaktNotification({
        companyName: validated.companyName,
        contactPerson: validated.contactPerson,
        email: validated.email,
        phone: validated.phone,
        employees: validated.employees,
        courseType: validated.courseType,
        message: validated.message,
      });
    } catch (emailError) {
      console.error("Kunne ikke sende notifikasjon til admin:", emailError);
      // Fortsett selv om e-post feiler
    }

    return NextResponse.json(
      { success: true, leadId: lead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bedrift lead:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Kunne ikke opprette forespørsel" },
      { status: 500 }
    );
  }
}

