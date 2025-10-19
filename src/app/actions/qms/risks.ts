"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  riskSchema,
  updateRiskSchema,
  type RiskInput,
  type UpdateRiskInput,
} from "@/lib/validations/qms";

type ActionResult =
  | { success: true; riskId?: string; message: string }
  | { success: false; error: string };

/**
 * Generer unikt risikonummer
 */
async function generateRiskNumber(): Promise<string> {
  const lastRisk = await db.qmsRisk.findFirst({
    where: { riskNo: { startsWith: "RISK-" } },
    orderBy: { riskNo: "desc" },
  });

  let nextNumber = 1;
  if (lastRisk) {
    const lastNumber = parseInt(lastRisk.riskNo.split("-")[1]);
    nextNumber = lastNumber + 1;
  }

  return `RISK-${String(nextNumber).padStart(3, "0")}`;
}

/**
 * Opprett ny risiko
 */
export async function createQmsRisk(data: RiskInput): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = riskSchema.parse(data);

    // Generer risikonummer
    const riskNo = await generateRiskNumber();

    // Beregn risikoscore
    const riskScore = validated.likelihood * validated.consequence;

    // Opprett risiko
    const risk = await db.qmsRisk.create({
      data: {
        riskNo,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        process: validated.process,
        likelihood: validated.likelihood,
        consequence: validated.consequence,
        riskScore,
        mitigationPlan: validated.mitigationPlan,
        ownerId: validated.ownerId,
        reviewDate: new Date(validated.reviewDate),
        status: "IDENTIFIED",
        createdBy: session.user.id,
      },
    });

    revalidatePath("/admin/kvalitet/risiko");

    return {
      success: true,
      riskId: risk.id,
      message: `Risiko ${riskNo} opprettet`,
    };
  } catch (error) {
    console.error("Feil ved opprettelse av risiko:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke opprette risiko" };
  }
}

/**
 * Oppdater risiko
 */
export async function updateQmsRisk(
  data: UpdateRiskInput
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    // Valider input
    const validated = updateRiskSchema.parse(data);

    // Hent eksisterende risiko
    const existing = await db.qmsRisk.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: "Risiko ikke funnet" };
    }

    // Beregn ny score hvis sannsynlighet eller konsekvens endres
    let riskScore = existing.riskScore;
    if (validated.likelihood || validated.consequence) {
      const newLikelihood = validated.likelihood || existing.likelihood;
      const newConsequence = validated.consequence || existing.consequence;
      riskScore = newLikelihood * newConsequence;
    }

    // Beregn residual score hvis residual verdier oppgis
    let residualScore = existing.residualScore;
    if (validated.residualLikelihood && validated.residualConsequence) {
      residualScore = validated.residualLikelihood * validated.residualConsequence;
    }

    // Oppdater
    await db.qmsRisk.update({
      where: { id: validated.id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description && { description: validated.description }),
        ...(validated.category && { category: validated.category }),
        ...(validated.process !== undefined && {
          process: validated.process,
        }),
        ...(validated.likelihood && { likelihood: validated.likelihood }),
        ...(validated.consequence && { consequence: validated.consequence }),
        riskScore,
        ...(validated.residualLikelihood !== undefined && {
          residualLikelihood: validated.residualLikelihood,
        }),
        ...(validated.residualConsequence !== undefined && {
          residualConsequence: validated.residualConsequence,
        }),
        ...(residualScore !== undefined && { residualScore }),
        ...(validated.mitigationPlan !== undefined && {
          mitigationPlan: validated.mitigationPlan,
        }),
        ...(validated.status && { status: validated.status }),
        ...(validated.ownerId && { ownerId: validated.ownerId }),
        ...(validated.reviewDate && {
          reviewDate: new Date(validated.reviewDate),
        }),
      },
    });

    revalidatePath("/admin/kvalitet/risiko");
    revalidatePath(`/admin/kvalitet/risiko/${validated.id}`);

    return {
      success: true,
      message: "Risiko oppdatert",
    };
  } catch (error) {
    console.error("Feil ved oppdatering av risiko:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Kunne ikke oppdatere risiko" };
  }
}

/**
 * Slett risiko
 */
export async function deleteQmsRisk(riskId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Ikke autentisert" };
    }

    await db.qmsRisk.delete({
      where: { id: riskId },
    });

    revalidatePath("/admin/kvalitet/risiko");

    return { success: true, message: "Risiko slettet" };
  } catch (error) {
    console.error("Feil ved sletting av risiko:", error);
    return { success: false, error: "Kunne ikke slette risiko" };
  }
}

