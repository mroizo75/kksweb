"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  securityPolicySchema,
  updateSecurityPolicySchema,
  type SecurityPolicyInput,
  type UpdateSecurityPolicyInput,
} from "@/lib/validations/security";
import { POLICY_TEMPLATES } from "@/lib/security-policies-templates";
import { logAudit, logCreate, logUpdate } from "@/lib/audit-logger";

/**
 * Generer unikt policy-nummer
 */
async function generatePolicyNumber(category: string): Promise<string> {
  const count = await db.securityPolicy.count({
    where: {
      policyNumber: {
        startsWith: "POL-SEC-",
      },
    },
  });
  const nextNumber = (count + 1).toString().padStart(3, "0");
  return `POL-SEC-${nextNumber}`;
}

/**
 * Opprett standard sikkerhetspolitikker
 */
export async function createStandardPolicies() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const createdPolicies = [];

    for (const template of POLICY_TEMPLATES) {
      // Sjekk om policy allerede eksisterer
      const existing = await db.securityPolicy.findFirst({
        where: {
          title: template.title,
        },
      });

      if (existing) {
        continue; // Skip hvis den allerede eksisterer
      }

      const policyNumber = await generatePolicyNumber(template.category);

      const policy = await db.securityPolicy.create({
        data: {
          policyNumber,
          title: template.title,
          category: template.category,
          description: template.description,
          purpose: template.purpose,
          scope: template.scope,
          policy: template.policy,
          procedures: template.procedures,
          reviewSchedule: template.reviewSchedule,
          applicableTo: template.applicableTo,
          status: "APPROVED", // Standard policies er forhåndsgodkjente
          effectiveDate: new Date(),
          nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 år frem
        },
      });

      createdPolicies.push(policy);

      // Logg i audit log
      await logCreate(
        (session.user as any).id,
        session.user.email!,
        "SecurityPolicy",
        policy.id,
        { policyNumber, title: policy.title }
      );
    }

    revalidatePath("/admin/sikkerhet/politikk");

    return {
      success: true,
      count: createdPolicies.length,
      message: `${createdPolicies.length} sikkerhetspolitikker opprettet`,
    };
  } catch (error) {
    console.error("Error creating standard policies:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Kunne ikke opprette politikker",
    };
  }
}

/**
 * Opprett ny sikkerhetspolitikk
 */
export async function createSecurityPolicy(data: SecurityPolicyInput) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = securityPolicySchema.parse(data);

    const policyNumber = await generatePolicyNumber(validated.category);

    const policy = await db.securityPolicy.create({
      data: {
        policyNumber,
        title: validated.title,
        category: validated.category,
        description: validated.description,
        purpose: validated.purpose,
        scope: validated.scope,
        policy: validated.policy,
        procedures: validated.procedures,
        reviewSchedule: validated.reviewSchedule,
        applicableTo: validated.applicableTo,
        effectiveDate: validated.effectiveDate ? new Date(validated.effectiveDate) : undefined,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : undefined,
        nextReview: validated.nextReview ? new Date(validated.nextReview) : undefined,
      },
    });

    // Logg i audit log
    await logCreate(
      (session.user as any).id,
      session.user.email!,
      "SecurityPolicy",
      policy.id,
      { policyNumber, title: policy.title }
    );

    revalidatePath("/admin/sikkerhet/politikk");

    return { success: true, policyId: policy.id, policyNumber };
  } catch (error) {
    console.error("Error creating security policy:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Kunne ikke opprette politikk",
    };
  }
}

/**
 * Oppdater sikkerhetspolitikk
 */
export async function updateSecurityPolicy(data: UpdateSecurityPolicyInput) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = updateSecurityPolicySchema.parse(data);

    const policy = await db.securityPolicy.findUnique({
      where: { id: validated.id },
    });

    if (!policy) {
      return { success: false, error: "Politikk ikke funnet" };
    }

    const updateData: any = {};

    if (validated.title) updateData.title = validated.title;
    if (validated.description) updateData.description = validated.description;
    if (validated.purpose) updateData.purpose = validated.purpose;
    if (validated.scope) updateData.scope = validated.scope;
    if (validated.policy) updateData.policy = validated.policy;
    if (validated.procedures !== undefined) updateData.procedures = validated.procedures;
    if (validated.status) updateData.status = validated.status;
    if (validated.version) updateData.version = validated.version;
    if (validated.approvedBy) {
      updateData.approvedBy = validated.approvedBy;
      updateData.approvedAt = new Date();
    }
    if (validated.reviewSchedule) updateData.reviewSchedule = validated.reviewSchedule;
    if (validated.nextReview) updateData.nextReview = new Date(validated.nextReview);
    if (validated.lastReviewed) updateData.lastReviewed = new Date(validated.lastReviewed);
    if (validated.applicableTo) updateData.applicableTo = validated.applicableTo;
    if (validated.effectiveDate) updateData.effectiveDate = new Date(validated.effectiveDate);
    if (validated.expiryDate) updateData.expiryDate = new Date(validated.expiryDate);

    await db.securityPolicy.update({
      where: { id: validated.id },
      data: updateData,
    });

    // Logg i audit log
    await logUpdate(
      (session.user as any).id,
      session.user.email!,
      "SecurityPolicy",
      policy.id,
      { policyNumber: policy.policyNumber, changes: validated }
    );

    revalidatePath("/admin/sikkerhet/politikk");
    revalidatePath(`/admin/sikkerhet/politikk/${policy.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating security policy:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Kunne ikke oppdatere politikk",
    };
  }
}

/**
 * Aktiver sikkerhetspolitikk (sett til ACTIVE)
 */
export async function activateSecurityPolicy(id: string) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const policy = await db.securityPolicy.findUnique({
      where: { id },
    });

    if (!policy) {
      return { success: false, error: "Politikk ikke funnet" };
    }

    await db.securityPolicy.update({
      where: { id },
      data: {
        status: "ACTIVE",
        approvedBy: (session.user as any).id,
        approvedAt: new Date(),
        effectiveDate: new Date(),
      },
    });

    // Logg i audit log
    await logAudit({
      action: "UPDATE",
      userId: (session.user as any).id,
      userEmail: session.user.email!,
      entity: "SecurityPolicy",
      entityId: id,
      description: `Sikkerhetspolitikk aktivert: ${policy.policyNumber}`,
    });

    revalidatePath("/admin/sikkerhet/politikk");
    revalidatePath(`/admin/sikkerhet/politikk/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Error activating policy:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke aktivere politikk",
    };
  }
}

/**
 * Slett sikkerhetspolitikk (kun admin, kun DRAFT status)
 */
export async function deleteSecurityPolicy(id: string) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ingen tilgang" };
    }

    const policy = await db.securityPolicy.findUnique({
      where: { id },
    });

    if (!policy) {
      return { success: false, error: "Politikk ikke funnet" };
    }

    if (policy.status !== "DRAFT") {
      return { success: false, error: "Kun politikker i DRAFT kan slettes. Arkiver den i stedet." };
    }

    await db.securityPolicy.delete({
      where: { id },
    });

    // Logg i audit log
    await logAudit({
      action: "DELETE",
      userId: (session.user as any).id,
      userEmail: session.user.email!,
      entity: "SecurityPolicy",
      entityId: id,
      description: `Sikkerhetspolitikk slettet: ${policy.policyNumber}`,
      metadata: { policyNumber: policy.policyNumber, title: policy.title },
    });

    revalidatePath("/admin/sikkerhet/politikk");

    return { success: true };
  } catch (error) {
    console.error("Error deleting security policy:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke slette politikk",
    };
  }
}

