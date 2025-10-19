import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support både enkelt lead og bulk import
    const leads = body.leads ? body.leads : [body];

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ingen leads mottatt" },
        { status: 400 }
      );
    }

    const createdLeads = [];
    const errors = [];

    for (const leadData of leads) {
      try {
        // Validate required fields
        if (!leadData.name || leadData.name.length < 2) {
          errors.push({ data: leadData, error: "Navn er påkrevd" });
          continue;
        }

        // Create lead
        const lead = await db.lead.create({
          data: {
            name: leadData.name,
            email: leadData.email || null,
            phone: leadData.phone || null,
            companyName: leadData.companyName || null,
            source: leadData.source || "Webhook",
            status: "NEW",
            notes: leadData.notes || null,
            assignedToId: leadData.assignedToId || null,
          },
        });

        createdLeads.push(lead);
      } catch (error) {
        console.error("Feil ved opprett lead fra webhook:", error);
        errors.push({
          data: leadData,
          error: error instanceof Error ? error.message : "Ukjent feil",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdLeads.length} leads opprettet${errors.length > 0 ? `, ${errors.length} feilet` : ""}`,
      created: createdLeads.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Webhook feil:", error);
    return NextResponse.json(
      { success: false, error: "Webhook feilet" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return webhook info
  return NextResponse.json({
    webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/leads`,
    methods: ["POST"],
    description: "Send lead data as JSON to automatically create leads in CRM",
    example: {
      single: {
        name: "Ola Nordmann",
        email: "ola@example.com",
        phone: "12345678",
        companyName: "Nordmann AS",
        source: "Innut.no",
        notes: "Optional notes",
      },
      bulk: {
        leads: [
          {
            name: "Ola Nordmann",
            email: "ola@example.com",
            phone: "12345678",
            companyName: "Nordmann AS",
            source: "Innut.no",
          },
          {
            name: "Kari Hansen",
            email: "kari@bedrift.no",
            phone: "98765432",
            companyName: "Hansen Bygg",
            source: "Innut.no",
          },
        ],
      },
    },
  });
}

