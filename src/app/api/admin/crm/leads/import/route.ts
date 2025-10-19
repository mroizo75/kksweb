import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { csvData, defaultSource, defaultAssignedTo } = await request.json();

    if (!csvData || typeof csvData !== "string") {
      return NextResponse.json(
        { success: false, error: "CSV-data mangler" },
        { status: 400 }
      );
    }

    // Parse CSV
    const lines = csvData
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ingen data å importere" },
        { status: 400 }
      );
    }

    // Sjekk om første linje er header
    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.includes("navn") ||
      firstLine.includes("e-post") ||
      firstLine.includes("email");

    const dataLines = hasHeader ? lines.slice(1) : lines;

    const createdLeads = [];
    const errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        // Support both comma and semicolon as delimiter
        const delimiter = dataLines[i].includes(";") ? ";" : ",";
        const fields = dataLines[i]
          .split(delimiter)
          .map((f) => f.trim().replace(/^["']|["']$/g, "")); // Remove quotes

        // Minimum requirement: name
        if (!fields[0] || fields[0].length < 2) {
          errors.push(`Linje ${i + 1}: Mangler gyldig navn`);
          continue;
        }

        const leadData: any = {
          name: fields[0],
          email: fields[1] || null,
          phone: fields[2] || null,
          companyName: fields[3] || null,
          source: fields[4] || defaultSource || "Import",
          status: "NEW",
          assignedToId: defaultAssignedTo || null,
        };

        // Validate email if provided
        if (leadData.email && !leadData.email.includes("@")) {
          errors.push(`Linje ${i + 1}: Ugyldig e-post`);
          continue;
        }

        const lead = await db.lead.create({
          data: leadData,
        });

        createdLeads.push(lead);
      } catch (error) {
        console.error(`Feil ved import av linje ${i + 1}:`, error);
        errors.push(`Linje ${i + 1}: ${error instanceof Error ? error.message : "Ukjent feil"}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdLeads.length} leads importert${errors.length > 0 ? `, ${errors.length} feilet` : ""}`,
      imported: createdLeads.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Feil ved import av leads:", error);
    return NextResponse.json(
      { success: false, error: "Import feilet" },
      { status: 500 }
    );
  }
}

