/**
 * Gyldighetslogikk for kompetansebevis
 */

import { addYears } from "date-fns";
import type { ValidityPolicy } from "@prisma/client";

export interface CalculateValidityParams {
  completedAt: Date;
  policy?: ValidityPolicy | null;
}

export interface ValidityResult {
  validFrom: Date;
  validTo: Date | null;
}

/**
 * Beregn gyldighetsperiode basert på policy
 */
export function calculateValidity(
  params: CalculateValidityParams
): ValidityResult {
  const { completedAt, policy } = params;

  if (!policy) {
    // Ingen policy = ingen utløp
    return {
      validFrom: completedAt,
      validTo: null,
    };
  }

  switch (policy.kind) {
    case "NONE":
      // Ingen utløp
      return {
        validFrom: completedAt,
        validTo: null,
      };

    case "FIXED_YEARS":
      // Fast antall år
      if (!policy.years) {
        throw new Error("ValidityPolicy med kind=FIXED_YEARS må ha 'years' satt");
      }

      const validTo = addYears(completedAt, policy.years);

      return {
        validFrom: completedAt,
        validTo,
      };

    case "CUSTOM_RULE":
      // Egendefinert regel (TODO: Implementer senere)
      // For nå, behandle som NONE
      return {
        validFrom: completedAt,
        validTo: null,
      };

    default:
      throw new Error(`Ukjent ValidityKind: ${policy.kind}`);
  }
}

/**
 * Sjekk om et kompetansebevis er gyldig
 */
export function isCredentialValid(
  validTo: Date | null,
  graceDays: number = 0
): boolean {
  if (!validTo) {
    // Ingen utløpsdato = alltid gyldig
    return true;
  }

  const now = new Date();
  const expiryWithGrace = new Date(validTo);
  expiryWithGrace.setDate(expiryWithGrace.getDate() + graceDays);

  return now <= expiryWithGrace;
}

/**
 * Beregn status for kompetansebevis
 */
export function getCredentialStatus(
  validTo: Date | null,
  graceDays: number = 0
): "valid" | "expiring_soon" | "expired" {
  if (!validTo) {
    return "valid";
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (now > validTo) {
    // Sjekk om vi er innenfor grace period
    const expiryWithGrace = new Date(validTo);
    expiryWithGrace.setDate(expiryWithGrace.getDate() + graceDays);

    if (now > expiryWithGrace) {
      return "expired";
    }
  }

  if (validTo <= thirtyDaysFromNow) {
    return "expiring_soon";
  }

  return "valid";
}

/**
 * Generer unik kompetansebevis-kode
 */
export function generateCredentialCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CRD-${timestamp}-${random}`;
}

