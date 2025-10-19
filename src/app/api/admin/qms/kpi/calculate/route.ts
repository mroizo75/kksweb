import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateAllAutomaticKpis } from "@/lib/kpi-calculator";

/**
 * API endpoint for å trigge automatisk KPI-beregning
 * 
 * POST /api/admin/qms/kpi/calculate
 */
export async function POST() {
  try {
    const session = await auth();

    // Sjekk autentisering
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Ikke autentisert" },
        { status: 401 }
      );
    }

    // Kjør beregninger
    const result = await updateAllAutomaticKpis();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${result.updated} KPI(er) oppdatert`,
        updated: result.updated,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Noen KPIer feilet",
          updated: result.updated,
          errors: result.errors,
        },
        { status: 207 } // Multi-Status
      );
    }
  } catch (error) {
    console.error("Feil ved KPI-beregning:", error);
    return NextResponse.json(
      { error: "Kunne ikke beregne KPIer" },
      { status: 500 }
    );
  }
}

