"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  kpiSchema,
  updateKpiSchema,
  type KpiInput,
  type UpdateKpiInput,
} from "@/lib/validations/qms";

type ActionResult =
  | { success: true; kpiId?: string; message: string }
  | { success: false; error: string };

/**
 * Opprett ny KPI
 */
export async function createQmsKpi(
  data: KpiInput & { isAutomatic?: boolean; calculationRule?: string }
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = kpiSchema.parse(data);

    // Opprett KPI
    const kpi = await db.qmsKpi.create({
      data: {
        name: validated.name,
        description: validated.description,
        category: validated.category,
        unit: validated.unit,
        target: validated.target,
        threshold: validated.threshold,
        frequency: validated.frequency,
        dataSource: validated.dataSource,
        isAutomatic: data.isAutomatic || false,
        calculationRule: data.calculationRule,
        ownerId: validated.ownerId,
        status: "NO_DATA",
        active: true,
        createdBy: session.user.id,
      },
    });

    revalidatePath("/admin/kvalitet/kpi");

    return {
      success: true,
      kpiId: kpi.id,
      message: `KPI "${validated.name}" opprettet`,
    };
  } catch (error) {
    console.error("Feil ved opprettelse av KPI:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke opprette KPI" };
  }
}

/**
 * Oppdater KPI
 */
export async function updateQmsKpi(
  data: UpdateKpiInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = updateKpiSchema.parse(data);

    // Hent eksisterende KPI
    const existing = await db.qmsKpi.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: "KPI ikke funnet" };
    }

    // Oppdater
    await db.qmsKpi.update({
      where: { id: validated.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && {
          description: validated.description,
        }),
        ...(validated.category && { category: validated.category }),
        ...(validated.unit && { unit: validated.unit }),
        ...(validated.target !== undefined && { target: validated.target }),
        ...(validated.threshold !== undefined && {
          threshold: validated.threshold,
        }),
        ...(validated.frequency && { frequency: validated.frequency }),
        ...(validated.dataSource !== undefined && {
          dataSource: validated.dataSource,
        }),
        ...(validated.ownerId && { ownerId: validated.ownerId }),
        ...(validated.active !== undefined && { active: validated.active }),
      },
    });

    revalidatePath("/admin/kvalitet/kpi");
    revalidatePath(`/admin/kvalitet/kpi/${validated.id}`);

    return {
      success: true,
      message: "KPI oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdatering av KPI:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke oppdatere KPI" };
  }
}

/**
 * Legg til måling
 */
export async function addKpiMeasurement(
  kpiId: string,
  value: number,
  note?: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Hent KPI
    const kpi = await db.qmsKpi.findUnique({
      where: { id: kpiId },
    });

    if (!kpi) {
      return { success: false, error: "KPI ikke funnet" };
    }

    // Opprett måling
    await db.qmsKpiMeasurement.create({
      data: {
        kpiId,
        value,
        measuredAt: new Date(),
        note,
        measuredBy: session.user.id,
      },
    });

    // Oppdater KPI status
    let status: "ON_TARGET" | "WARNING" | "OFF_TARGET" = "ON_TARGET";
    
    if (value >= kpi.target) {
      status = "ON_TARGET";
    } else if (kpi.threshold && value >= kpi.threshold) {
      status = "WARNING";
    } else {
      status = "OFF_TARGET";
    }

    await db.qmsKpi.update({
      where: { id: kpiId },
      data: {
        currentValue: value,
        lastMeasured: new Date(),
        status,
      },
    });

    revalidatePath("/admin/kvalitet/kpi");
    revalidatePath(`/admin/kvalitet/kpi/${kpiId}`);

    return {
      success: true,
      message: "Måling registrert",
    };
  } catch (error) {
    console.error("Feil ved registrering av måling:", error);
    return { success: false, error: "Kunne ikke registrere måling" };
  }
}

/**
 * Slett KPI
 */
export async function deleteQmsKpi(kpiId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Slett alle målinger først
    await db.qmsKpiMeasurement.deleteMany({
      where: { kpiId },
    });

    // Slett KPI
    await db.qmsKpi.delete({
      where: { id: kpiId },
    });

    revalidatePath("/admin/kvalitet/kpi");

    return { success: true, message: "KPI slettet" };
  } catch (error) {
    console.error("Feil ved sletting av KPI:", error);
    return { success: false, error: "Kunne ikke slette KPI" };
  }
}

