/**
 * Automatisk KPI-beregning
 * 
 * Dette biblioteket beregner KPIer automatisk basert på faktiske data i systemet.
 */

import { db } from "@/lib/db";
import { subMonths, subDays } from "date-fns";

export type KpiCalculationType =
  | "NC_COUNT" // Antall avvik
  | "NC_OPEN_COUNT" // Antall åpne avvik
  | "NC_AVG_CLOSE_TIME" // Gjennomsnittlig tid til lukning (dager)
  | "COURSE_COMPLETION_RATE" // Kursfullføringsgrad (%)
  | "RENEWAL_RATE" // Fornyelsesrate (%)
  | "CRM_CONVERSION_RATE" // Lead til Deal konvertering (%)
  | "ENROLLMENT_COUNT" // Antall påmeldinger
  | "ACTIVE_COURSES"; // Antall aktive kurs

/**
 * Beregn antall avvik i perioden
 */
async function calculateNcCount(months: number = 1): Promise<number> {
  const fromDate = subMonths(new Date(), months);

  const count = await db.qmsNonConformance.count({
    where: {
      detectedAt: {
        gte: fromDate,
      },
    },
  });

  return count;
}

/**
 * Beregn antall åpne avvik
 */
async function calculateNcOpenCount(): Promise<number> {
  const count = await db.qmsNonConformance.count({
    where: {
      status: {
        in: ["OPEN", "INVESTIGATING", "ACTION"],
      },
    },
  });

  return count;
}

/**
 * Beregn gjennomsnittlig tid til lukning av avvik (i dager)
 */
async function calculateNcAvgCloseTime(months: number = 3): Promise<number> {
  const fromDate = subMonths(new Date(), months);

  const closedNcs = await db.qmsNonConformance.findMany({
    where: {
      status: "CLOSED",
      closedAt: {
        gte: fromDate,
      },
    },
    select: {
      detectedAt: true,
      closedAt: true,
    },
  });

  if (closedNcs.length === 0) return 0;

  const totalDays = closedNcs.reduce((sum, nc) => {
    if (!nc.closedAt) return sum;
    const days = Math.floor(
      (nc.closedAt.getTime() - nc.detectedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  return Math.round(totalDays / closedNcs.length);
}

/**
 * Beregn kursfullføringsgrad (%)
 */
async function calculateCourseCompletionRate(months: number = 3): Promise<number> {
  const fromDate = subMonths(new Date(), months);

  // Hent alle påmeldinger i perioden
  const enrollments = await db.enrollment.findMany({
    where: {
      createdAt: {
        gte: fromDate,
      },
    },
    select: {
      id: true,
      sessionId: true,
      personId: true,
    },
  });

  if (enrollments.length === 0) return 0;

  // Tell hvor mange som har fullført (har assessment med attended = true)
  let completed = 0;
  for (const enrollment of enrollments) {
    const assessment = await db.assessment.findFirst({
      where: {
        sessionId: enrollment.sessionId,
        personId: enrollment.personId,
        attended: true,
      },
    });
    if (assessment) {
      completed++;
    }
  }

  return Math.round((completed / enrollments.length) * 100);
}

/**
 * Beregn fornyelsesrate (%)
 */
async function calculateRenewalRate(months: number = 3): Promise<number> {
  const fromDate = subMonths(new Date(), months);

  // Hent alle fornyelser som forfaller i perioden
  const renewals = await db.renewalTask.findMany({
    where: {
      dueDate: {
        gte: fromDate,
        lte: new Date(),
      },
    },
  });

  if (renewals.length === 0) return 0;

  // Tell hvor mange som er fullført
  const completed = renewals.filter((r) => r.status === "COMPLETED").length;

  return Math.round((completed / renewals.length) * 100);
}

/**
 * Beregn CRM-konverteringsrate (Lead til Deal) (%)
 */
async function calculateCrmConversionRate(months: number = 3): Promise<number> {
  const fromDate = subMonths(new Date(), months);

  // Hent alle leads i perioden
  const leads = await db.lead.findMany({
    where: {
      createdAt: {
        gte: fromDate,
      },
    },
  });

  if (leads.length === 0) return 0;

  // Hent deals som er konvertert fra leads i perioden (match på email)
  const leadEmails = leads.map((l) => l.email).filter((e): e is string => e !== null);
  
  const deals = await db.deal.findMany({
    where: {
      createdAt: {
        gte: fromDate,
      },
      person: {
        email: {
          in: leadEmails,
        },
      },
    },
  });

  return Math.round((deals.length / leads.length) * 100);
}

/**
 * Beregn antall påmeldinger i perioden
 */
async function calculateEnrollmentCount(months: number = 1): Promise<number> {
  const fromDate = subMonths(new Date(), months);

  const count = await db.enrollment.count({
    where: {
      createdAt: {
        gte: fromDate,
      },
    },
  });

  return count;
}

/**
 * Beregn antall aktive kurs
 */
async function calculateActiveCourses(): Promise<number> {
  const count = await db.course.count({
    where: {
      published: true,
    },
  });

  return count;
}

/**
 * Hovedfunksjon for å beregne en KPI
 */
export async function calculateKpiValue(
  calculationType: KpiCalculationType,
  periodMonths: number = 1
): Promise<number> {
  switch (calculationType) {
    case "NC_COUNT":
      return calculateNcCount(periodMonths);
    
    case "NC_OPEN_COUNT":
      return calculateNcOpenCount();
    
    case "NC_AVG_CLOSE_TIME":
      return calculateNcAvgCloseTime(periodMonths);
    
    case "COURSE_COMPLETION_RATE":
      return calculateCourseCompletionRate(periodMonths);
    
    case "RENEWAL_RATE":
      return calculateRenewalRate(periodMonths);
    
    case "CRM_CONVERSION_RATE":
      return calculateCrmConversionRate(periodMonths);
    
    case "ENROLLMENT_COUNT":
      return calculateEnrollmentCount(periodMonths);
    
    case "ACTIVE_COURSES":
      return calculateActiveCourses();
    
    default:
      throw new Error(`Ukjent beregningstype: ${calculationType}`);
  }
}

/**
 * Oppdater alle automatiske KPIer
 */
export async function updateAllAutomaticKpis(): Promise<{
  success: boolean;
  updated: number;
  errors: string[];
}> {
  try {
    // Hent alle automatiske KPIer
    const automaticKpis = await db.qmsKpi.findMany({
      where: {
        isAutomatic: true,
        active: true,
      },
    });

    let updated = 0;
    const errors: string[] = [];

    for (const kpi of automaticKpis) {
      try {
        if (!kpi.calculationRule) {
          errors.push(`KPI ${kpi.name}: Ingen beregningsregel definert`);
          continue;
        }

        // Beregn ny verdi
        const value = await calculateKpiValue(
          kpi.calculationRule as KpiCalculationType,
          1 // Siste måned som standard
        );

        // Beregn status
        let status: "ON_TARGET" | "WARNING" | "OFF_TARGET" = "ON_TARGET";
        if (value >= kpi.target) {
          status = "ON_TARGET";
        } else if (kpi.threshold && value >= kpi.threshold) {
          status = "WARNING";
        } else {
          status = "OFF_TARGET";
        }

        // Oppdater KPI
        await db.qmsKpi.update({
          where: { id: kpi.id },
          data: {
            currentValue: value,
            lastMeasured: new Date(),
            status,
          },
        });

        // Opprett måling
        await db.qmsKpiMeasurement.create({
          data: {
            kpiId: kpi.id,
            value,
            measuredAt: new Date(),
            note: "Automatisk beregnet",
            measuredBy: kpi.createdBy, // Bruker som opprettet KPIen
          },
        });

        updated++;
      } catch (error) {
        errors.push(
          `KPI ${kpi.name}: ${error instanceof Error ? error.message : "Ukjent feil"}`
        );
      }
    }

    return {
      success: errors.length === 0,
      updated,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      updated: 0,
      errors: [error instanceof Error ? error.message : "Ukjent feil"],
    };
  }
}

/**
 * Liste over tilgjengelige automatiske beregninger
 */
export const AVAILABLE_CALCULATIONS = [
  {
    type: "NC_COUNT" as KpiCalculationType,
    name: "Antall avvik (siste måned)",
    description: "Teller alle avvik registrert i perioden",
    unit: "antall",
    category: "QUALITY" as const,
  },
  {
    type: "NC_OPEN_COUNT" as KpiCalculationType,
    name: "Antall åpne avvik",
    description: "Teller alle avvik som ikke er lukket",
    unit: "antall",
    category: "QUALITY" as const,
  },
  {
    type: "NC_AVG_CLOSE_TIME" as KpiCalculationType,
    name: "Gjennomsnittlig tid til avvikslukning",
    description: "Beregner gjennomsnittlig antall dager fra avvik oppdages til lukkes",
    unit: "dager",
    category: "PROCESS" as const,
  },
  {
    type: "COURSE_COMPLETION_RATE" as KpiCalculationType,
    name: "Kursfullføringsgrad",
    description: "Prosent av påmeldte som fullfører kurset (>80% fremmøte)",
    unit: "%",
    category: "QUALITY" as const,
  },
  {
    type: "RENEWAL_RATE" as KpiCalculationType,
    name: "Fornyelsesrate",
    description: "Prosent av fornyelser som fullføres",
    unit: "%",
    category: "CUSTOMER" as const,
  },
  {
    type: "CRM_CONVERSION_RATE" as KpiCalculationType,
    name: "Lead til Deal konvertering",
    description: "Prosent av leads som konverteres til deals",
    unit: "%",
    category: "FINANCIAL" as const,
  },
  {
    type: "ENROLLMENT_COUNT" as KpiCalculationType,
    name: "Antall påmeldinger",
    description: "Teller alle påmeldinger i perioden",
    unit: "antall",
    category: "DELIVERY" as const,
  },
  {
    type: "ACTIVE_COURSES" as KpiCalculationType,
    name: "Antall aktive kurs",
    description: "Teller alle publiserte kurs",
    unit: "antall",
    category: "DELIVERY" as const,
  },
] as const;

